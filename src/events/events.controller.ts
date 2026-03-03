import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Request } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
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
    getFullStructure(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.eventsService.getFullStructure(id, req.user);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.eventsService.findOne(id, req.user);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.eventsService.findAll(req.user);
    }

    @Get(':id/session-speakers')
    getSessionSpeakers(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.getSessionSpeakers(id);
    }

    @Patch(':id/session-speakers/sort')
    updateSessionSpeakersSort(@Param('id', ParseIntPipe) id: number, @Body() data: { updates: { id: number, sortOrder: number }[] }) {
        return this.eventsService.updateSessionSpeakersSort(id, data.updates);
    }

    @Get(':id/announcements')
    getAnnouncements(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.getAnnouncements(id);
    }

    @Patch(':id/announcements')
    updateAnnouncements(@Param('id', ParseIntPipe) id: number, @Body() data: { updates: any[] }) {
        return this.eventsService.updateAnnouncements(id, data.updates);
    }

    @Get(':id/memo-template')
    getMemoTemplate(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.getMemoTemplate(id);
    }

    @Patch(':id/memo-template')
    updateMemoTemplate(@Param('id', ParseIntPipe) id: number, @Body() data: { template: string }) {
        return this.eventsService.updateMemoTemplate(id, data.template);
    }

    @Patch('session-speakers/:id')
    updateSessionSpeaker(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.eventsService.updateSessionSpeaker(id, data);
    }

    @Public()
    @Get('public/speaker-memo/:hash')
    getPublicSpeakerMemo(@Param('hash') hash: string) {
        return this.eventsService.getPublicSpeakerMemo(hash);
    }
}
