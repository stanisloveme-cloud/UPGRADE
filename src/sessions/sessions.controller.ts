import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    create(@Body() data: { trackId: number; name: string; startTime: string; endTime: string; description?: string; speakerIds?: number[]; questions?: any[]; briefings?: any[] }) {
        return this.sessionsService.create(data);
    }

    @Get()
    findAll() {
        return this.sessionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sessionsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<{ name: string; startTime: string; endTime: string; description: string; speakers: any[]; questions: any[]; briefings: any[] }>) {
        return this.sessionsService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sessionsService.remove(id);
    }
}
