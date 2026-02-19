import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Body() createEventDto: CreateEventDto) {
        return this.eventsService.create(createEventDto);
    }

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
