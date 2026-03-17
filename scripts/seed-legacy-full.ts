import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TARGET_EVENT_ID = 76;

const cleanString = (str: any) => {
    if (!str) return null;
    return str.toString().replace(/\s+/g, ' ').trim();
};

const mapSpeakerStatus = (legacyId: number): any => {
    const statusMap: Record<number, string> = {
        1: 'confirmed', 2: 'pre_confirmed', 3: 'contact', 4: 'to_contact', 5: 'declined', 6: 'review'
    };
    return statusMap[legacyId] || 'review';
};

const mapSpeakerRole = (legacyId: number): any => {
    return legacyId === 1 ? 'moderator' : 'speaker';
};

function resolveDate(dayString: string): Date {
    // Map "21 октября" to 2025-10-21, etc.
    const monthMap: Record<string, number> = {
        'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
        'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };
    const parts = dayString.split(' ');
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase();
    
    // We assume 2025 based on NRF2025 context
    const date = new Date(Date.UTC(2025, monthMap[monthStr] !== undefined ? monthMap[monthStr] : 9, isNaN(day) ? 1 : day));
    return date;
}

async function run() {
    console.log(`🚀 Starting Full Migration for Event ID: ${TARGET_EVENT_ID}`);

    // Read the raw JSON
    const rawData = fs.readFileSync('tmp/legacy_event_16.json', 'utf8');
    const legacyJson = JSON.parse(rawData);
    
    const program = legacyJson.props?.program || {};
    const conferences = program.conferences || {};

    // 1. Ensure Event Exists
    let event = await prisma.event.findUnique({ where: { id: TARGET_EVENT_ID } });
    if (!event) {
        console.log(`Event ${TARGET_EVENT_ID} not found. Creating placeholder event.`);
        event = await prisma.event.create({
            data: {
                id: TARGET_EVENT_ID,
                name: "New Retail Forum 2025 (Migrated)",
                startDate: new Date('2025-10-21'),
                endDate: new Date('2025-10-24'),
                status: 'published'
            }
        });
    }

    // Optional: WIPE existing data for this event to avoid duplicates during test
    console.log('🧹 Wiping existing Halls, Tracks, Sessions for this event...');
    await prisma.hall.deleteMany({ where: { eventId: TARGET_EVENT_ID } });

    // Track state
    const createdSpeakers = new Map<number, number>(); // Map legacy_person_id -> new_speaker_id

    let trackSortCount = 0;

    for (const [dayString, halls] of Object.entries(conferences)) {
        const trackDate = resolveDate(dayString);
        
        for (const [hallId, tracks] of Object.entries(halls as any)) {
            // Because hall name isn't directly in this loop without extra mapping, 
            // we will use the track's first session's hall info if available, or fallback.
            // Actually, in the UI we used "Зал Трансформер" etc. 
            // We can create a hall for each unique hallId per day, or just create a generic one.
            // Let's create a Hall if it doesn't exist for this event
            const hallName = `Зал ${hallId}`; // Or map properly if we have a hall map
            
            let hall = await prisma.hall.findFirst({
                where: { eventId: TARGET_EVENT_ID, name: hallName }
            });

            if (!hall) {
                hall = await prisma.hall.create({
                    data: {
                        eventId: TARGET_EVENT_ID,
                        name: hallName,
                        capacity: 200,
                        sortOrder: parseInt(hallId) || 0
                    }
                });
            }

            for (const t of (tracks as any[])) {
                
                trackSortCount++;
                const track = await prisma.track.create({
                    data: {
                        hallId: hall.id,
                        name: cleanString(t.title) || 'Без названия',
                        description: null, // As per our finding
                        day: trackDate,
                        startTime: t.minStart || '00:00',
                        endTime: t.maxEnd || '23:59',
                        sortOrder: trackSortCount
                    }
                });

                for (const sess of (t.sessions || [])) {
                    
                    let sessionName = null;
                    let sessionDesc = null;
                    let legacyQuestions: any[] = [];

                    if (sess.themes && sess.themes.length > 0) {
                        sessionName = cleanString(sess.themes[0].title);
                        sessionDesc = cleanString(sess.themes[0].description);
                        legacyQuestions = sess.themes[0].questions || [];
                    } else {
                        sessionName = track.name; 
                    }

                    const session = await prisma.session.create({
                        data: {
                            trackId: track.id,
                            name: sessionName,
                            description: sessionDesc,
                            startTime: sess.time_start || track.startTime,
                            endTime: sess.time_end || track.endTime,
                        }
                    });

                    // Insert Questions
                    for (const q of legacyQuestions) {
                        await prisma.sessionQuestion.create({
                            data: {
                                sessionId: session.id,
                                order: q.sort_order || 0,
                                title: cleanString(q.title) || 'Question',
                                body: cleanString(q.description)
                            }
                        });
                    }

                    // Process Speakers
                    let speakerSortOrder = 0;
                    for (const sp of (sess.speakers || [])) {
                        const person = sp.speaker_person;
                        if (!person) continue;

                        let newSpeakerId = createdSpeakers.get(person.id);

                        if (!newSpeakerId) {
                            // Find or create speaker in the global database
                            const emailStr = cleanString(person.email);
                            let existingSpeaker = null;
                            
                            if (emailStr) {
                                existingSpeaker = await prisma.speaker.findFirst({
                                    where: { email: emailStr }
                                });
                            }

                            if (!existingSpeaker) {
                                existingSpeaker = await prisma.speaker.create({
                                    data: {
                                        firstName: cleanString(person.name) || 'Speaker',
                                        lastName: cleanString(person.surname) || '',
                                        company: cleanString(person.company),
                                        position: cleanString(person.job_title),
                                        email: emailStr,
                                        bio: cleanString(person.biography),
                                        photoUrl: person.speaker_photo?.urls?.original || null
                                    }
                                });
                            }
                            
                            newSpeakerId = existingSpeaker.id;
                            createdSpeakers.set(person.id, newSpeakerId);
                        }

                        // Attach to session
                        speakerSortOrder++;
                        try {
                            await prisma.sessionSpeaker.create({
                                data: {
                                    sessionId: session.id,
                                    speakerId: newSpeakerId,
                                    role: mapSpeakerRole(sp.speaker_role_id),
                                    status: mapSpeakerStatus(sp.speaker_status_id),
                                    statusDate: sp.contact_date ? new Date(sp.contact_date) : null,
                                    needsCall: sp.is_zoom === true,
                                    programThesis: cleanString(sp.theme),
                                    newsletterQuote: cleanString(sp.quote),
                                    sortOrder: speakerSortOrder
                                }
                            });
                        } catch (e: any) {
                             if (e.code === 'P2002') {
                                 // Unique constraint failed, speaker already in session
                                 console.warn(`[!] Skipping duplicate speaker attachment: Session ${session.id}, Speaker ${newSpeakerId}`);
                             } else {
                                 throw e;
                             }
                        }
                    }
                }
            }
            console.log(`✅ Hall ${hallName} processed`);
        }
    }

    console.log(`\n🎉 Migration Complete! 
Event ID: ${TARGET_EVENT_ID}
Halls Created: (Re-run logs)
Unique Speakers processed: ${createdSpeakers.size}
`);
}

run()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
