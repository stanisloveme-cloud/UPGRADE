import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: { trackId: number; name: string; startTime: string; endTime: string; description?: string; speakerIds?: number[]; questions?: any[]; briefings?: any[] }) {
        const { speakerIds, questions, briefings, ...sessionData } = data;

        return this.prisma.session.create({
            data: {
                ...sessionData,
                speakers: speakerIds && speakerIds.length > 0 ? {
                    create: speakerIds.map((id, index) => ({
                        speaker: { connect: { id } },
                        role: 'speaker', // Default role
                        status: 'confirmed', // Default status
                        sortOrder: index
                    }))
                } : undefined,
                questions: questions && questions.length > 0 ? {
                    create: questions.map((q, index) => ({
                        order: index,
                        title: q.title || '',
                        body: q.body || ''
                    }))
                } : undefined,
                briefings: briefings && briefings.length > 0 ? {
                    create: briefings.map(b => ({
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
    }

    findAll() {
        return this.prisma.session.findMany({
            include: { speakers: { include: { speaker: true } } },
            orderBy: { startTime: 'asc' },
        });
    }

    async findOne(id: number) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: {
                speakers: { include: { speaker: true }, orderBy: { sortOrder: 'asc' } },
                questions: { orderBy: { order: 'asc' } },
                briefings: true,
            },
        });
        if (!session) throw new NotFoundException(`Session #${id} not found`);
        return session;
    }

    async update(id: number, data: Partial<{ name: string; startTime: string; endTime: string; description: string; speakers: any[]; questions: any[]; briefings: any[] }>) {
        const { speakers, questions, briefings, ...sessionData } = data;

        return this.prisma.$transaction(async (prisma) => {
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
                                create: speakers.map((s, index) => ({
                                    speaker: { connect: { id: s.speakerId } },
                                    role: s.role || 'speaker',
                                    status: s.status || 'confirmed',
                                    companySnapshot: s.companySnapshot,
                                    positionSnapshot: s.positionSnapshot,
                                    presentationTitle: s.presentationTitle,
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
                        data: questions.map((q, index) => ({
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
                        data: briefings.map(b => ({
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

            return prisma.session.findUnique({
                where: { id },
                include: {
                    speakers: { include: { speaker: true } },
                    questions: { orderBy: { order: 'asc' } },
                    briefings: { include: { moderator: true } }
                }
            });
        });
    }

    remove(id: number) {
        return this.prisma.session.delete({ where: { id } });
    }
}
