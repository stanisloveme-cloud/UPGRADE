import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PublicEventsController } from './public-events.controller';
import { PublicEventsService } from './public-events.service';

@Module({
    controllers: [EventsController, PublicEventsController],
    providers: [EventsService, PublicEventsService],
})
export class EventsModule { }
