import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicEventsService {
    constructor(private prisma: PrismaService) { }

    async getWebsiteDataForEvent(eventId: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                name: true,
                description: true,
                startDate: true,
                endDate: true,
            },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Fetch approved Sponsors
        const eventSponsors = await this.prisma.eventSponsor.findMany({
            where: {
                eventId,
                sponsor: { exportToWebsite: true },
            },
            include: {
                sponsor: {
                    select: {
                        id: true,
                        name: true,
                        shortDescription: true,
                        websiteUrl: true,
                        logoFileUrl: true,
                        segments: {
                            select: {
                                marketSegment: {
                                    select: { id: true, name: true, parentId: true }
                                }
                            }
                        }
                    },
                },
            },
        });

        const sponsors = eventSponsors.map((es: any) => es.sponsor);

        // Fetch Schedule (Halls -> Tracks -> Sessions -> Speakers)
        // Only include confirmed/pre_confirmed speakers with exportToWebsite = true
        const halls = await this.prisma.hall.findMany({
            where: { eventId },
            orderBy: { sortOrder: 'asc' },
            include: {
                tracks: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        sessions: {
                            orderBy: { startTime: 'asc' },
                            include: {
                                speakers: {
                                    where: {
                                        exportToWebsite: true,
                                        status: { in: ['confirmed', 'pre_confirmed'] },
                                    },
                                    orderBy: { sortOrder: 'asc' },
                                    include: {
                                        speaker: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                                company: true,
                                                position: true,
                                                photoUrl: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return {
            event,
            sponsors,
            halls,
        };
    }
}
