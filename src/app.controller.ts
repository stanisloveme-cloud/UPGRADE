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
        return legacyId === 1 ? 'speaker' : 'moderator';
    };

    function resolveDate(dayString: string): Date {
        // Map "21 октября" to 2025-10-21
        const monthMap: Record<string, number> = {
            'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
            'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };
        const parts = dayString.split(' ');
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1].toLowerCase();
        
        return new Date(Date.UTC(2025, monthMap[monthStr] !== undefined ? monthMap[monthStr] : 9, isNaN(day) ? 1 : day));
    }

    // 1. Ensure Event Exists
    let event = await this.prisma.event.findUnique({ where: { id: TARGET_EVENT_ID } });
    if (!event) {
        console.log(`Event ${TARGET_EVENT_ID} not found. Creating Event 76.`);
        event = await this.prisma.event.create({
            data: {
                id: TARGET_EVENT_ID,
                name: "New Retail Forum 2025",
                startDate: new Date('2025-10-21'),
                endDate: new Date('2025-10-24'),
                status: 'published'
            }
        });
    }

    // WIPE existing data for this event to avoid duplicates
    console.log('🧹 Wiping existing Halls, Tracks, Sessions for Event 76...');
    await this.prisma.hall.deleteMany({ where: { eventId: TARGET_EVENT_ID } });

    const conferencesMap = program.conferences;
    const createdSpeakers = new Map<number, number>(); // legacy_person_id -> new_speaker_id
    
    let trackSortCount = 0;
    let sessionCount = 0;

    for (const [dayString, halls] of Object.entries(conferencesMap)) {
        const trackDate = resolveDate(dayString);
        
        for (const [hallId, tracks] of Object.entries(halls as any)) {
            const hallName = `Зал ${hallId}`;
            
            let hall = await this.prisma.hall.findFirst({
                where: { eventId: TARGET_EVENT_ID, name: hallName }
            });

            if (!hall) {
                hall = await this.prisma.hall.create({
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
                const track = await this.prisma.track.create({
                    data: {
                        hallId: hall.id,
                        name: cleanString(t.title) || 'Без названия',
                        description: null,
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

                    const session = await this.prisma.session.create({
                        data: {
                            trackId: track.id,
                            name: sessionName,
                            description: sessionDesc,
                            startTime: sess.time_start || track.startTime,
                            endTime: sess.time_end || track.endTime,
                        }
                    });
                    sessionCount++;

                    // Insert Questions
                    let qIndex = 1;
                    for (const q of legacyQuestions) {
                        const rawDesc = cleanString(q.description) || '';
                        const parts = rawDesc.split(/<br\s*\/?>/i);
                        let rawTitle = parts[0].replace(/<[^>]+>/g, '').trim() || 'Вопрос';
                        if (rawTitle.length > 250) rawTitle = rawTitle.substring(0, 250) + '...';
                        
                        const qNum = q.number || q.sort_order || qIndex;
                        
                        await this.prisma.sessionQuestion.create({
                            data: {
                                sessionId: session.id,
                                order: q.sort_order || qIndex,
                                title: `#${qNum}`,
                                body: rawDesc
                            }
                        });
                        qIndex++;
                    }

                    // Process Speakers
                    let speakerSortOrder = 0;
                    for (const sp of (sess.speakers || [])) {
                        const person = sp.speaker_person;
                        if (!person) continue;

                        let newSpeakerId = createdSpeakers.get(person.id);

                        if (!newSpeakerId) {
                            const emailStr = cleanString(person.email);
                            const fName = cleanString(person.name) || 'Speaker';
                            const lName = cleanString(person.surname) || '';
                            let existingSpeaker = null;
                            
                            if (emailStr) {
                                existingSpeaker = await this.prisma.speaker.findFirst({
                                    where: { email: emailStr }
                                });
                            } else {
                                existingSpeaker = await this.prisma.speaker.findFirst({
                                    where: { firstName: fName, lastName: lName }
                                });
                            }

                            if (!existingSpeaker) {
                                existingSpeaker = await this.prisma.speaker.create({
                                    data: {
                                        firstName: fName,
                                        lastName: lName,
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

                        speakerSortOrder++;
                        try {
                            await this.prisma.sessionSpeaker.create({
                                data: {
                                    sessionId: session.id,
                                    speakerId: newSpeakerId,
                                    role: mapSpeakerRole(sp.speaker_role_id),
                                    status: mapSpeakerStatus(sp.speaker_status_id),
                                    statusDate: sp.contact_date ? new Date(sp.contact_date) : null,
                                    needsCall: sp.is_zoom === true,
                                    programThesis: cleanString(sp.theme),
                                    newsletterQuote: cleanString(sp.quote),
                                    sortOrder: speakerSortOrder,
                                    companySnapshot: cleanString(person.company),
                                    positionSnapshot: cleanString(person.job_title)
                                }
                            });
                        } catch (e: any) {
                             if (e.code === 'P2002') {
                                 console.warn(`[!] Skipping duplicate speaker attachment: Session ${session.id}, Speaker ${newSpeakerId}`);
                             } else {
                                 console.error('Error attaching speaker', e);
                             }
                        }
                    }
                }
            }
        }
    }

    return {
        success: true,
        eventId: TARGET_EVENT_ID,
        trackCount: trackSortCount,
        sessionCount,
        speakerCount: createdSpeakers.size
    };
  }
}
