import { Test, TestingModule } from '@nestjs/testing';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';

describe('SponsorsController', () => {
  let controller: SponsorsController;
  let service: SponsorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SponsorsController],
      providers: [
        {
          provide: SponsorsService,
          useValue: {
            findAllByEvent: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getPublicApprovalInfo: jest.fn(),
            submitPublicApproval: jest.fn(),
            attachToEvent: jest.fn(),
            detachFromEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SponsorsController>(SponsorsController);
    service = module.get<SponsorsService>(SponsorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
