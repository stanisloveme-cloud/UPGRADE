import { Test, TestingModule } from '@nestjs/testing';
import { PublicEventsController } from './public-events.controller';
import { PublicEventsService } from './public-events.service';

describe('PublicEventsController', () => {
    let controller: PublicEventsController;
    let service: PublicEventsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PublicEventsController],
            providers: [
                {
                    provide: PublicEventsService,
                    useValue: {
                        getWebsiteDataForEvent: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PublicEventsController>(PublicEventsController);
        service = module.get<PublicEventsService>(PublicEventsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getWebsiteData', () => {
        it('should call getWebsiteDataForEvent on service with proper ID', async () => {
            const mockResult = { event: { id: 1 }, sponsors: [], halls: [] };
            (service.getWebsiteDataForEvent as jest.Mock).mockResolvedValue(mockResult);

            const result = await controller.getWebsiteData(1);

            expect(service.getWebsiteDataForEvent).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockResult);
        });
    });
});
