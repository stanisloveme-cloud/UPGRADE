import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Controller('tracks')
export class TracksController {
    constructor(private readonly tracksService: TracksService) { }

    @Post()
    create(@Body() createTrackDto: CreateTrackDto) {
        return this.tracksService.create(createTrackDto);
    }

    @Get()
    findAll() {
        return this.tracksService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tracksService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTrackDto: UpdateTrackDto) {
        return this.tracksService.update(id, updateTrackDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tracksService.remove(id);
    }
}
