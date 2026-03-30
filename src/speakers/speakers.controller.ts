import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { SpeakersService } from './speakers.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SpeakerEntity } from './entities/speaker.entity';

@ApiTags('speakers')
@Controller('speakers')
export class SpeakersController {
    constructor(private readonly speakersService: SpeakersService) { }

    @ApiOperation({ summary: 'Create a new speaker' })
    @ApiResponse({ type: SpeakerEntity, status: 201 })
    @Post()
    create(@Body() createSpeakerDto: CreateSpeakerDto) {
        return this.speakersService.create(createSpeakerDto);
    }

    @ApiOperation({ summary: 'Import legacy speakers' })
    @Post('import-legacy')
    importLegacy() {
        return this.speakersService.importLegacy();
    }

    @ApiOperation({ summary: 'Sync speaker photos' })
    @Post('sync-photos')
    @Public()
    syncPhotos(@Body() payload: { name: string, photoUrl: string }[]) {
        return this.speakersService.syncPhotos(payload);
    }

    @ApiOperation({ summary: 'Get all speakers' })
    @ApiResponse({ type: [SpeakerEntity], status: 200 })
    @Get()
    findAll() {
        return this.speakersService.findAll();
    }

    @ApiOperation({ summary: 'Get a single speaker by ID' })
    @ApiResponse({ type: SpeakerEntity, status: 200 })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.speakersService.findOne(id);
    }

    @ApiOperation({ summary: 'Update an existing speaker' })
    @ApiResponse({ type: SpeakerEntity, status: 200 })
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSpeakerDto: UpdateSpeakerDto) {
        return this.speakersService.update(id, updateSpeakerDto);
    }

    @ApiOperation({ summary: 'Delete a speaker' })
    @ApiResponse({ type: SpeakerEntity, status: 200 })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.speakersService.remove(id);
    }
}
