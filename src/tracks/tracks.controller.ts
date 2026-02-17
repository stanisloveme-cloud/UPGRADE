import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TracksService } from './tracks.service';

@Controller('tracks')
export class TracksController {
    constructor(private readonly tracksService: TracksService) { }

    @Post()
    create(@Body() data: { hallId: number; name: string; day: string; startTime: string; endTime: string; sortOrder?: number }) {
        return this.tracksService.create(data);
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
    update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<{ name: string; startTime: string; endTime: string }>) {
        return this.tracksService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tracksService.remove(id);
    }
}
