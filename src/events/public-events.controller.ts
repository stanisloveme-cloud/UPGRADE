import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PublicEventsService } from './public-events.service';
import { Public } from '../auth/public.decorator';

@Controller('public/events')
export class PublicEventsController {
    constructor(private readonly publicEventsService: PublicEventsService) { }

    @Public()
    @Get(':id/website-data')
    getWebsiteData(@Param('id', ParseIntPipe) id: number) {
        return this.publicEventsService.getWebsiteDataForEvent(id);
    }

    @Public()
    @Get(':id/schedule')
    getSchedule(@Param('id', ParseIntPipe) id: number) {
        return this.publicEventsService.getScheduleForEvent(id);
    }

    @Public()
    @Get(':id/speakers')
    getSpeakers(@Param('id', ParseIntPipe) id: number) {
        return this.publicEventsService.getSpeakersForEvent(id);
    }

    @Public()
    @Get(':id/sponsors')
    getSponsors(@Param('id', ParseIntPipe) id: number) {
        return this.publicEventsService.getSponsorsForEvent(id);
    }
}
