import { Test, TestingModule } from '@nestjs/testing';
import { PublicEventsService } from './public-events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PublicEventsService', () => {
    let service: PublicEventsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PublicEventsService,
                {
                    provide: PrismaService,
                    useValue: {
                        event: {
                            findUnique: jest.fn(),
                        },
                        eventSponsor: {
                            findMany: jest.fn(),
                        },
                        hall: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PublicEventsService>(PublicEventsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getWebsiteDataForEvent', () => {
        it('should throw NotFoundException if event does not exist', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.getWebsiteDataForEvent(999)).rejects.toThrow(NotFoundException);
        });

        it('should return aggregated website data including filtered sponsors and schedule', async () => {
            const mockEvent = { id: 1, name: 'Test Event' };
            const mockEventSponsors = [{ sponsor: { id: 10, name: 'Sponsor A' } }];
            const mockHalls = [{ id: 100, name: 'Main Hall', tracks: [] }];

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.eventSponsor.findMany as jest.Mock).mockResolvedValue(mockEventSponsors);
            (prisma.hall.findMany as jest.Mock).mockResolvedValue(mockHalls);

            const result = await service.getWebsiteDataForEvent(1);

            expect(prisma.eventSponsor.findMany).toHaveBeenCalledWith({
                where: { eventId: 1, sponsor: { exportToWebsite: true } },
                include: expect.any(Object),
            });

            expect(prisma.hall.findMany).toHaveBeenCalledWith({
                where: { eventId: 1 },
                orderBy: expect.any(Object),
                include: expect.any(Object),
            });

            expect(result).toEqual({
                event: mockEvent,
                sponsors: [{ id: 10, name: 'Sponsor A' }],
                halls: mockHalls,
            });
        });
    });
});
