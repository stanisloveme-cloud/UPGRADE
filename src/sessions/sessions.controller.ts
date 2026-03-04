import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionGuard } from '../auth/session.guard';

@Controller('sessions')
@UseGuards(SessionGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    create(@Body() createSessionDto: CreateSessionDto, @Request() req: any) {
        const user = req.user || req.session?.user;
        return this.sessionsService.create(createSessionDto, user);
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
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSessionDto: UpdateSessionDto, @Request() req: any) {
        const user = req.user || req.session?.user;
        return this.sessionsService.update(id, updateSessionDto, user);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sessionsService.remove(id);
    }
}
