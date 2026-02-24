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

    async create(data: any) {
        return this.prisma.event.create({
            data: {
                name: data.name,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: 'draft',
            },
        });
    }

    async findOne(id: number) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) throw new NotFoundException(`Event #${id} not found`);
        return event;
    }

    async getFullStructure(id: number) {
        try {
            console.log(`Fetching full structure for event ${id}...`);
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

            if (!event) {
                console.warn(`Event ${id} not found`);
                throw new NotFoundException(`Event #${id} not found`);
            }
            console.log(`Successfully fetched event ${id}: ${event.name}`);
            return event;
        } catch (error) {
            console.error('Error in getFullStructure:', error);
            // DEBUG: Return error directly to see what failed on production
            return {
                halls: [],
                _isDebug: true,
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            };
        }
    }
}
