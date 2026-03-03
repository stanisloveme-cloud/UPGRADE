import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { Public } from '../auth/public.decorator';

@Controller('sponsors')
export class SponsorsController {
    constructor(private readonly sponsorsService: SponsorsService) { }

    @Get('event/:eventId')
    findAllByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
        return this.sponsorsService.findAllByEvent(eventId);
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

    @Public()
    @Get('public/approval/:hash')
    getPublicApprovalInfo(@Param('hash') hash: string) {
        return this.sponsorsService.getPublicApprovalInfo(hash);
    }

    @Public()
    @Patch('public/approval/:hash')
    submitPublicApproval(@Param('hash') hash: string, @Body() data: any) {
        return this.sponsorsService.submitPublicApproval(hash, data.status, data.rejectionReason);
    }
}
