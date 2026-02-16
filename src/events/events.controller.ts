import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('api/events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get(':id/full-structure')
    getFullStructure(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.getFullStructure(id);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.findOne(id);
    }

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }
}
