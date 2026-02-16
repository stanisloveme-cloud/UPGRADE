import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.event.findMany({
            orderBy: { startDate: 'desc' },
        });
    }

    async findOne(id: number) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) throw new NotFoundException(`Event #${id} not found`);
        return event;
    }

    async getFullStructure(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                halls: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        tracks: {
                            orderBy: { sortOrder: 'asc' },
                            include: {
                                sessions: {
                                    orderBy: { startTime: 'asc' },
                                    include: {
                                        speakers: {
                                            orderBy: { sortOrder: 'asc' },
                                            include: { speaker: true },
                                        },
                                        questions: { orderBy: { order: 'asc' } },
                                        briefings: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!event) throw new NotFoundException(`Event #${id} not found`);
        return event;
    }
}
