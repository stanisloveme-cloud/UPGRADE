import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notifications: NotificationsService
    ) { }

    private async checkSpeakerConflicts(trackId: number, startTime: string, endTime: string, speakerIds: number[], excludeSessionId?: number) {
        if (!speakerIds.length || !startTime || !endTime) return;

        // Convert HH:mm to minutes for easy comparison
        const timeToMinutes = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const startMins = timeToMinutes(startTime);
        const endMins = timeToMinutes(endTime);

        // Get the day of the current track
        const track = await this.prisma.track.findUnique({ where: { id: trackId } });
        if (!track) return;

        // Find all other sessions on the same track day that these speakers are in
        const overlappingSpeakers = await this.prisma.sessionSpeaker.findMany({
            where: {
                speakerId: { in: speakerIds },
                session: {
                    track: { day: track.day },
                    id: excludeSessionId ? { not: excludeSessionId } : undefined
                }
            },
            include: {
                session: true,
                speaker: true
            }
        });

        const conflicts = overlappingSpeakers.filter(ss => {
            const otherStart = timeToMinutes(ss.session.startTime);
            const otherEnd = timeToMinutes(ss.session.endTime);
            // Overlap condition: max(start1, start2) < min(end1, end2)
            return Math.max(startMins, otherStart) < Math.min(endMins, otherEnd);
        });

        if (conflicts.length > 0) {
            const msgs = conflicts.map(c => `Спикер ${c.speaker.firstName} ${c.speaker.lastName} уже занят в сессии "${c.session.name}" (${c.session.startTime}-${c.session.endTime})`);
            throw new ConflictException({ message: msgs.join('. '), conflicts });
        }
    }

    private async notifySpeakers(sessionId: number, newSpeakerIds: number[]) {
        if (!newSpeakerIds.length) return;
        const session = await this.prisma.session.findUnique({ where: { id: sessionId }, include: { track: { include: { hall: true } } } });
        const speakers = await this.prisma.speaker.findMany({ where: { id: { in: newSpeakerIds } } });

        for (const sp of speakers) {
            if (sp.email) {
                await this.notifications.sendEmail(
                    sp.email,
                    `Вы добавлены в сессию: ${session?.name}`,
                    `Здравствуйте, ${sp.firstName}!\n\nВы добавлены как участник в сессию "${session?.name}", которая пройдет ${session?.startTime}-${session?.endTime}.\nЗал: ${session?.track.hall.name}.\n\nДо встречи!`
                );
            }
        }
    }

    async create(createSessionDto: CreateSessionDto) {
        const { speakers, questions, briefings, ignoreConflicts, ...sessionData } = createSessionDto;

        // Extract speaker IDs
        const speakerIds = speakers ? speakers.map((s: any) => s.speakerId || s.id).filter(Boolean).map(Number) : [];

        // Conflict Detection
        if (!ignoreConflicts && speakerIds.length > 0) {
            await this.checkSpeakerConflicts(sessionData.trackId, sessionData.startTime, sessionData.endTime, speakerIds);
        }

        const session = await this.prisma.session.create({
            data: {
                ...sessionData,
                speakers: speakers && speakers.length > 0 ? {
                    create: speakers.map((s: any, index: number) => ({
                        speaker: { connect: { id: s.speakerId || s.id } },
                        role: s.role || 'speaker',
                        status: s.status || 'confirmed',
                        sortOrder: index,
                        companySnapshot: s.companySnapshot,
                        positionSnapshot: s.positionSnapshot,
                        presentationTitle: s.presentationTitle,
                        presentationUrl: s.presentationUrl
                    }))
                } : undefined,
                questions: questions && questions.length > 0 ? {
                    create: questions.map((q: any, index: number) => ({
                        order: index,
                        title: q.title || '',
                        body: q.body || ''
                    }))
                } : undefined,
                briefings: briefings && briefings.length > 0 ? {
                    create: briefings.map((b: any) => ({
                        moderatorId: b.moderatorId ? Number(b.moderatorId) : null,
                        datetime: b.datetime || new Date(),
                        isDone: b.isDone || false,
                        link: b.link || '',
                        comment: b.comment || ''
                    }))
                } : undefined
            },
            include: { speakers: { include: { speaker: true } }, questions: { orderBy: { order: 'asc' } }, briefings: { include: { moderator: true } } }
        });

        if (speakers && speakers.length > 0) {
            await this.notifySpeakers(session.id, speakerIds);
        }

        return session;
    }

    findAll() {
        return this.prisma.session.findMany({
            include: {
                speakers: { include: { speaker: true }, orderBy: { sortOrder: 'asc' } },
                questions: { orderBy: { order: 'asc' } },
                briefings: { include: { moderator: true } }
            },
            orderBy: { startTime: 'asc' }
        });
    }

    async findOne(id: number) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: {
                track: true,
                speakers: { include: { speaker: true }, orderBy: { sortOrder: 'asc' } },
                questions: { orderBy: { order: 'asc' } },
                briefings: { include: { moderator: true } }
            }
        });
        if (!session) throw new NotFoundException(`Session #${id} not found`);
        return session;
    }

    async update(id: number, updateSessionDto: UpdateSessionDto) {
        const { speakers, questions, briefings, ignoreConflicts, updatedAt, force, ...sessionData } = updateSessionDto as any;

        // Check if session exists
        const existingSession = await this.findOne(id);

        // Optimistic Concurrency Control (OCC)
        if (updatedAt && !force) {
            const existingDate = new Date(existingSession.updatedAt).getTime();
            const requestedDate = new Date(updatedAt).getTime();
            // If DB is newer by more than a second, it's a conflict
            if (existingDate > requestedDate + 1000) {
                throw new ConflictException({
                    message: 'Внимание: Эти данные были параллельно изменены другим пользователем.',
                    code: 'CONCURRENT_EDIT',
                    dbUpdatedAt: existingSession.updatedAt
                });
            }
        }

        // Extract speaker IDs
        const speakerIds = speakers ? speakers.map((s: any) => Number(s.speakerId || s.id)).filter(Boolean) : [];

        // Conflict Detection
        // Use provided times or fallback to existing
        const startTime = sessionData.startTime || existingSession.startTime;
        const endTime = sessionData.endTime || existingSession.endTime;
        const trackId = sessionData.trackId || existingSession.trackId;

        if (!ignoreConflicts && speakerIds.length > 0 && startTime && endTime && trackId) {
            await this.checkSpeakerConflicts(trackId, startTime, endTime, speakerIds, id);
        }

        const result = await this.prisma.$transaction(async (prisma) => {
            // 1. Update session base data
            if (Object.keys(sessionData).length > 0) {
                await prisma.session.update({
                    where: { id },
                    data: sessionData
                });
            }

            // 2. Update speakers if provided
            if (speakers) {
                await prisma.sessionSpeaker.deleteMany({ where: { sessionId: id } });
                if (speakers.length > 0) {
                    await prisma.session.update({
                        where: { id },
                        data: {
                            speakers: {
                                create: speakers.map((s: any, index: number) => ({
                                    speaker: { connect: { id: Number(s.speakerId) } },
                                    role: s.role || 'speaker',
                                    status: s.status || 'confirmed',
                                    companySnapshot: s.companySnapshot,
                                    positionSnapshot: s.positionSnapshot,
                                    presentationTitle: s.presentationTitle,
                                    presentationUrl: s.presentationUrl,
                                    sortOrder: index
                                }))
                            }
                        }
                    });
                }
            }

            // 3. Update questions if provided
            if (questions) {
                await prisma.sessionQuestion.deleteMany({ where: { sessionId: id } });
                if (questions.length > 0) {
                    await prisma.sessionQuestion.createMany({
                        data: questions.map((q: any, index: number) => ({
                            sessionId: id,
                            order: index,
                            title: q.title || '',
                            body: q.body || ''
                        }))
                    });
                }
            }

            // 4. Update briefings if provided
            if (briefings) {
                await prisma.briefing.deleteMany({ where: { sessionId: id } });
                if (briefings.length > 0) {
                    await prisma.briefing.createMany({
                        data: briefings.map((b: any) => ({
                            sessionId: id,
                            moderatorId: b.moderatorId ? Number(b.moderatorId) : null,
                            datetime: b.datetime || new Date(),
                            isDone: b.isDone || false,
                            link: b.link || '',
                            comment: b.comment || ''
                        }))
                    });
                }
            }

            const updatedSession = await prisma.session.findUnique({
                where: { id },
                include: {
                    speakers: { include: { speaker: true }, orderBy: { sortOrder: 'asc' } },
                    questions: { orderBy: { order: 'asc' } },
                    briefings: { include: { moderator: true } }
                }
            });

            return updatedSession;
        });

        // Notify speakers outside transaction if they were updated
        if (speakers && speakers.length > 0) {
            await this.notifySpeakers(id, speakerIds).catch(err => console.error('Failed to notify speakers', err));
        }

        return result;
    }

    remove(id: number) {
        return this.prisma.session.delete({ where: { id } });
    }
}
