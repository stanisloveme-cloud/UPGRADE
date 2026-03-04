import { Test, TestingModule } from '@nestjs/testing';
import { SponsorsService } from './sponsors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SponsorsService', () => {
  let service: SponsorsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SponsorsService,
        {
          provide: PrismaService,
          useValue: {
            sponsor: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
            },
            eventSponsor: {
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SponsorsService>(SponsorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByEvent', () => {
    it('should return sponsors for a specific event', async () => {
      const mockEventSponsors = [
        { sponsor: { id: 1, name: 'Brand A' } },
        { sponsor: { id: 2, name: 'Brand B' } },
      ];
      (prisma.eventSponsor.findMany as jest.Mock).mockResolvedValue(mockEventSponsors);

      const result = await service.findAllByEvent(1);
      expect(prisma.eventSponsor.findMany).toHaveBeenCalledWith({
        where: { eventId: 1 },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(result).toEqual([{ id: 1, name: 'Brand A' }, { id: 2, name: 'Brand B' }]);
    });
  });

  describe('create', () => {
    it('should create a sponsor and link it to an event if eventId is provided', async () => {
      const createDto = {
        name: 'New Brand',
        exportToWebsite: true,
        eventId: 1,
      };
      const createdSponsor = { id: 10, name: 'New Brand', exportToWebsite: true };

      (prisma.sponsor.create as jest.Mock).mockResolvedValue(createdSponsor);
      (prisma.eventSponsor.create as jest.Mock).mockResolvedValue({});

      const result = await service.create(createDto);

      expect(prisma.sponsor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'New Brand', exportToWebsite: true }),
      });
      expect(prisma.eventSponsor.create).toHaveBeenCalledWith({
        data: { eventId: 1, sponsorId: 10 },
      });
      expect(result).toEqual(createdSponsor);
    });

    it('should handle exportToWebsite as string boolean', async () => {
      const createDto = { name: 'Booleany Brand', exportToWebsite: 'true' };
      (prisma.sponsor.create as jest.Mock).mockResolvedValue({ id: 11 });

      await service.create(createDto);

      expect(prisma.sponsor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ exportToWebsite: true }),
      });
    });
  });
});
