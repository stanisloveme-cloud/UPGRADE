import { Controller, Get, Post, Body, Inject, forwardRef } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(
    @Inject(forwardRef(() => AppService))
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed-legacy')
  @Public()
  async seedLegacy(@Body() parsed: any) {
    console.log('🚀 Starting Legacy Event Seeding...');

    const program = parsed.props?.program;
    if (!program || !program.conferences) {
        return { success: false, error: 'Could not find "conferences" in the JSON payload.' };
    }

    // 1. Create a Master Event
    const event = await this.prisma.event.create({
        data: {
            name: "New Retail Forum 2025",
            startDate: new Date("2025-10-21"),
            endDate: new Date("2025-10-22"),
            status: "published"
        }
    });

    const conferencesMap = program.conferences;
    const hallMap = new Map<string, any>(); 

    let trackCount = 0;
    let sessionCount = 0;
    let speakerCount = 0;

    for (const [dateStr, hallsObj] of Object.entries(conferencesMap)) {
        const typedHallsObj = hallsObj as Record<string, any[]>;
        
        for (const [legacyHallId, conferencesArr] of Object.entries(typedHallsObj)) {
            for (const conf of conferencesArr) {
                // Ensure Hall exists
                let dbHall = hallMap.get(legacyHallId);
                if (!dbHall) {
                    const hallName = conf.event_hall?.title || `Hall ${legacyHallId}`;
                    dbHall = await this.prisma.hall.create({
                        data: {
                            eventId: event.id,
                            name: hallName
                        }
                    });
                    hallMap.set(legacyHallId, dbHall);
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

                const day = new Date(conf.raw_date || "2025-10-21");
                const track = await this.prisma.track.create({
                    data: {
                        hallId: dbHall.id,
                        name: conf.title || "Untitled Track",
                        day: day,
                        startTime: minStart.substring(0, 5),
                        endTime: maxEnd.substring(0, 5)
                    }
                });
                trackCount++;

                for (const sess of sessionsResp) {
                    const session = await this.prisma.session.create({
                        data: {
                            trackId: track.id,
                            name: conf.title || `Session ${sess.id}`,
                            description: sess.description || null,
                            startTime: sess.time_start.substring(0, 5),
                            endTime: sess.time_end.substring(0, 5)
                        }
                    });
                    sessionCount++;

                    const speakersResp = sess.speakers || [];
                    for (const spk of speakersResp) {
                        const person = spk.speaker_person;
                        if (!person && !spk.temp_contact) continue;

                        const fName = person ? (person.name || "Unknown") : (spk.temp_contact || "Unknown");
                        const lName = person ? (person.surname || "") : "";
                        const company = person ? person.company : spk.temp_company;
                        const position = person ? person.job_title : null;
                        
                        let photoUrl = null;
                        if (person && person.speaker_photo && person.speaker_photo.urls) {
                            photoUrl = person.speaker_photo.urls.default;
                        }

                        let dbSpeaker = await this.prisma.speaker.findFirst({
                            where: { firstName: fName, lastName: lName }
                        });

                        if (!dbSpeaker) {
                            dbSpeaker = await this.prisma.speaker.create({
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

                        await this.prisma.sessionSpeaker.create({
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

    return {
        success: true,
        eventId: event.id,
        trackCount,
        sessionCount,
        speakerCount
    };
  }
}
