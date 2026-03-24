import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { Public } from '../auth/public.decorator';

@Controller('sponsors')
export class SponsorsController {
    constructor(private readonly sponsorsService: SponsorsService) { }

    @Get('event/:eventId')
    findAllByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
        return this.sponsorsService.findAllByEvent(eventId);
    }

    @Get('all')
    findAll(@Query() query: any) {
        return this.sponsorsService.findAll(query);
    }

    @Post()
    create(@Body() createSponsorDto: any) {
        return this.sponsorsService.create(createSponsorDto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSponsorDto: any) {
        return this.sponsorsService.update(id, updateSponsorDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sponsorsService.remove(id);
    }

    @Post(':id/attach/:eventId')
    attachToEvent(@Param('id', ParseIntPipe) sponsorId: number, @Param('eventId', ParseIntPipe) eventId: number) {
        return this.sponsorsService.attachToEvent(eventId, sponsorId);
    }

    @Delete(':id/detach/:eventId')
    detachFromEvent(@Param('id', ParseIntPipe) sponsorId: number, @Param('eventId', ParseIntPipe) eventId: number) {
        return this.sponsorsService.detachFromEvent(eventId, sponsorId);
    }

    @Public()
    @Get('public/approval/:hash')
    getPublicApprovalInfo(@Param('hash') hash: string) {
        return this.sponsorsService.getPublicApprovalInfo(hash);
    }

    @Public()
    @Post('import-legacy')
    importLegacyBrands() {
        return this.sponsorsService.importLegacyBrands();
    }

    @Public()
    @Get('fix-brands')
    fixBrands() {
        return this.sponsorsService.fixBrands();
    }
}
