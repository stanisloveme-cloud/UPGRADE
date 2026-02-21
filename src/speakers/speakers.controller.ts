import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';

@Controller('speakers')
export class SpeakersController {
    constructor(private readonly speakersService: SpeakersService) { }

    @Post()
    create(@Body() createSpeakerDto: CreateSpeakerDto) {
        return this.speakersService.create(createSpeakerDto);
    }

    @Get()
    findAll() {
        return this.speakersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.speakersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSpeakerDto: UpdateSpeakerDto) {
        return this.speakersService.update(id, updateSpeakerDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.speakersService.remove(id);
    }
}
