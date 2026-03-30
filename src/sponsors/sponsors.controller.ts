import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { Public } from '../auth/public.decorator';
import { ApiTags, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

export class PublicApprovalDto {
    @ApiProperty()
    status: string;

    @ApiPropertyOptional()
    rejectionReason?: string;
}

@ApiTags('sponsors')
@Controller('sponsors')
export class SponsorsController {
    constructor(private readonly sponsorsService: SponsorsService) { }

    @ApiOperation({ summary: 'Get sponsors by event ID' })
    @Get('event/:eventId')
    findAllByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
        return this.sponsorsService.findAllByEvent(eventId);
    }

    @ApiOperation({ summary: 'Get all sponsors (Brands)' })
    @Get('all')
    findAll(@Query() query: any) {
        return this.sponsorsService.findAll(query);
    }

    @ApiOperation({ summary: 'Create a new sponsor (Brand)' })
    @Post()
    create(@Body() createSponsorDto: CreateSponsorDto) {
        return this.sponsorsService.create(createSponsorDto);
    }

    @ApiOperation({ summary: 'Update an existing sponsor' })
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSponsorDto: UpdateSponsorDto) {
        return this.sponsorsService.update(id, updateSponsorDto);
    }

    @ApiOperation({ summary: 'Delete a sponsor' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sponsorsService.remove(id);
    }

    @ApiOperation({ summary: 'Attach sponsor to an event' })
    @Post(':id/attach/:eventId')
    attachToEvent(@Param('id', ParseIntPipe) sponsorId: number, @Param('eventId', ParseIntPipe) eventId: number) {
        return this.sponsorsService.attachToEvent(eventId, sponsorId);
    }

    @ApiOperation({ summary: 'Detach sponsor from an event' })
    @Delete(':id/detach/:eventId')
    detachFromEvent(@Param('id', ParseIntPipe) sponsorId: number, @Param('eventId', ParseIntPipe) eventId: number) {
        return this.sponsorsService.detachFromEvent(eventId, sponsorId);
    }

    @Public()
    @ApiOperation({ summary: 'Get public approval info for sponsor' })
    @Get('public/approval/:hash')
    getPublicApprovalInfo(@Param('hash') hash: string) {
        return this.sponsorsService.getPublicApprovalInfo(hash);
    }

    @Public()
    @ApiOperation({ summary: 'Submit public approval for sponsor' })
    @Patch('public/approval/:hash')
    submitPublicApproval(@Param('hash') hash: string, @Body() body: PublicApprovalDto) {
        return this.sponsorsService.submitPublicApproval(hash, body.status, body.rejectionReason || '');
    }

    @Public()
    @ApiOperation({ summary: 'Import legacy brands from previous CRM' })
    @Post('import-legacy')
    importLegacyBrands() {
        return this.sponsorsService.importLegacyBrands();
    }

    @Public()
    @ApiOperation({ summary: 'Run internal fix for brands' })
    @Get('fix-brands')
    fixBrands() {
        return this.sponsorsService.fixBrands();
    }
}
