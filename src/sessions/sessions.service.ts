import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: { trackId: number; name: string; startTime: string; endTime: string; description?: string; speakerIds?: number[] }) {
        const { speakerIds, ...sessionData } = data;

        return this.prisma.session.create({
            data: {
                ...sessionData,
                speakers: speakerIds && speakerIds.length > 0 ? {
                    create: speakerIds.map(id => ({
                        speaker: { connect: { id } },
                        role: 'speaker', // Default role
                        status: 'confirmed' // Default status
                    }))
                } : undefined
            },
            include: { speakers: { include: { speaker: true } } }
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

    async update(id: number, data: Partial<{ name: string; startTime: string; endTime: string; description: string; speakers: any[] }>) {
        const { speakers, ...sessionData } = data;

        if (speakers) {
            // Replace speakers: delete existing and create new
            // Use transaction to ensure consistency
            return this.prisma.$transaction(async (prisma) => {
                // Delete existing links
                await prisma.sessionSpeaker.deleteMany({ where: { sessionId: id } });

                // Update session and create new links with snapshots
                // We map through the speakers array which now contains { speakerId, companySnapshot, etc. }
                await prisma.session.update({
                    where: { id },
                    data: {
                        ...sessionData,
                        speakers: {
                            create: speakers.map(s => ({
                                speaker: { connect: { id: s.speakerId } },
                                role: 'speaker',
                                status: 'confirmed',
                                companySnapshot: s.companySnapshot,
                                positionSnapshot: s.positionSnapshot,
                                presentationTitle: s.presentationTitle
                            }))
                        }
                    }
                });

                return prisma.session.findUnique({
                    where: { id },
                    include: { speakers: { include: { speaker: true } } }
                });
            });
        }

        return this.prisma.session.update({
            where: { id },
            data: sessionData,
            include: { speakers: { include: { speaker: true } } }
        });
    }

    remove(id: number) {
        return this.prisma.session.delete({ where: { id } });
    }
}
