import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SpeakersService } from './speakers.service';

@Controller('speakers')
export class SpeakersController {
    constructor(private readonly speakersService: SpeakersService) { }

    @Post()
    create(@Body() data: any) {
        return this.speakersService.create(data);
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
    update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.speakersService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.speakersService.remove(id);
    }
}
