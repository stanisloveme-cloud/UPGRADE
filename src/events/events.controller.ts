import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Request } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateSessionSpeakersSortDto } from './dto/update-session-speakers-sort.dto';
import { UpdateAnnouncementsDto } from './dto/update-announcements.dto';
import { UpdateMemoTemplateDto } from './dto/update-memo-template.dto';
import { UpdateSessionSpeakerDto } from './dto/update-session-speaker.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('events')
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

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: any, @Request() req: any) {
        return this.eventsService.update(id, updateEventDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.eventsService.remove(id, req.user);
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
    updateSessionSpeakersSort(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateSessionSpeakersSortDto) {
        return this.eventsService.updateSessionSpeakersSort(id, data.updates);
    }

    @Get(':id/announcements')
    getAnnouncements(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.getAnnouncements(id);
    }

    @Patch(':id/announcements')
    updateAnnouncements(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateAnnouncementsDto) {
        return this.eventsService.updateAnnouncements(id, data.updates);
    }

    @Get(':id/memo-template')
    getMemoTemplate(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.getMemoTemplate(id);
    }

    @Patch(':id/memo-template')
    updateMemoTemplate(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateMemoTemplateDto) {
        return this.eventsService.updateMemoTemplate(id, data.template);
    }

    @Patch('session-speakers/:id')
    updateSessionSpeaker(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateSessionSpeakerDto) {
        return this.eventsService.updateSessionSpeaker(id, data);
    }

    @Public()
    @Get('public/speaker-memo/:hash')
    getPublicSpeakerMemo(@Param('hash') hash: string) {
        return this.eventsService.getPublicSpeakerMemo(hash);
    }
}
