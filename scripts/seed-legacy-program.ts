import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function run() {
    console.log('🚀 Starting Legacy Event Seeding...');

    const dataPath = path.resolve(__dirname, '../tmp/legacy_event_16.json');
    if (!fs.existsSync(dataPath)) {
        console.error('❌ File tmp/legacy_event_16.json not found!');
        process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(rawData);
    
    const program = parsed.props?.program;
    if (!program || !program.conferences) {
        console.error('❌ Could not find "conferences" in the JSON payload.');
        process.exit(1);
    }

    // 1. Create a Master Event
    const event = await prisma.event.create({
        data: {
            name: "New Retail Forum 2025",
            startDate: new Date("2025-10-21"),
            endDate: new Date("2025-10-22"), // Assuming 2 days
            status: "published"
        }
    });
    console.log(`✅ Created Event: ${event.name} (ID: ${event.id})`);

    const conferencesMap = program.conferences;
    const hallMap = new Map<string, any>(); 

    let trackCount = 0;
    let sessionCount = 0;
    let speakerCount = 0;

    for (const [dateStr, hallsObj] of Object.entries(conferencesMap)) {
        // hallsObj is a map of hallId -> Array of conferences
        const typedHallsObj = hallsObj as Record<string, any[]>;
        
        for (const [legacyHallId, conferencesArr] of Object.entries(typedHallsObj)) {
            for (const conf of conferencesArr) {
                // Ensure Hall exists
                let dbHall = hallMap.get(legacyHallId);
                if (!dbHall) {
                    const hallName = conf.event_hall?.title || `Hall ${legacyHallId}`;
                    dbHall = await prisma.hall.create({
                        data: {
                            eventId: event.id,
                            name: hallName
                        }
                    });
                    hallMap.set(legacyHallId, dbHall);
                    console.log(`🏛️  Created Hall: ${hallName}`);
                }

                // Determine start and end times
                let minStart = "23:59";
                let maxEnd = "00:00";
                const sessionsResp = conf.sessions || [];
                
                if (sessionsResp.length > 0) {
                    for (const s of sessionsResp) {
                        if (s.time_start < minStart) minStart = s.time_start;
                        if (s.time_end > maxEnd) maxEnd = s.time_end;
                    }
                } else {
                    minStart = "09:00";
                    maxEnd = "18:00";
                }

                // Create Track (Conference in Legacy)
                const day = new Date(conf.raw_date || "2025-10-21");
                const track = await prisma.track.create({
                    data: {
                        hallId: dbHall.id,
                        name: conf.title || "Untitled Track",
                        day: day,
                        startTime: minStart.substring(0, 5),
                        endTime: maxEnd.substring(0, 5)
                    }
                });
                trackCount++;

                // Create Sessions
                for (const sess of sessionsResp) {
                    const session = await prisma.session.create({
                        data: {
                            trackId: track.id,
                            name: conf.title || `Session ${sess.id}`, // Legacy uses the conference title as context
                            description: sess.description || null,
                            startTime: sess.time_start.substring(0, 5),
                            endTime: sess.time_end.substring(0, 5)
                        }
                    });
                    sessionCount++;

                    // Create Speakers
                    const speakersResp = sess.speakers || [];
                    for (const spk of speakersResp) {
                        const person = spk.speaker_person;
                        if (!person && !spk.temp_contact) continue; // skip empty

                        const fName = person ? (person.name || "Unknown") : (spk.temp_contact || "Unknown");
                        const lName = person ? (person.surname || "") : "";
                        const company = person ? person.company : spk.temp_company;
                        const position = person ? person.job_title : null;
                        
                        let photoUrl = null;
                        if (person && person.speaker_photo && person.speaker_photo.urls) {
                            photoUrl = person.speaker_photo.urls.default;
                        }

                        // Upsert Speaker by Name + Last Name logic to prevent duplicates
                        let dbSpeaker = await prisma.speaker.findFirst({
                            where: { firstName: fName, lastName: lName }
                        });

                        if (!dbSpeaker) {
                            dbSpeaker = await prisma.speaker.create({
                                data: {
                                    firstName: fName,
                                    lastName: lName,
                                    company: company,
                                    position: position,
                                    photoUrl: photoUrl,
                                    bio: person ? person.biography : null
                                }
                            });
                        }

                        // Attach Speaker to Session
                        await prisma.sessionSpeaker.create({
                            data: {
                                sessionId: session.id,
                                speakerId: dbSpeaker.id,
                                role: spk.speaker_role_id === 1 ? 'speaker' : 'moderator',
                                status: 'confirmed',
                                sortOrder: spk.sort || 0
                            }
                        });
                        speakerCount++;
                    }
                }
            }
        }
    }

    console.log(`\n🎉 Import Complete!`);
    console.log(`➡️  Tracks Imported: ${trackCount}`);
    console.log(`➡️  Sessions Imported: ${sessionCount}`);
    console.log(`➡️  Speakers Attached: ${speakerCount}`);
    console.log(`\n💡 To view this event on Tilda DevStand, open:`);
    console.log(`https://devupgrade.space4you.ru/test-tilda-standalone.html?eventId=${event.id}`);
}

run()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
