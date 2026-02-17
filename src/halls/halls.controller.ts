import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { HallsService } from './halls.service';

@Controller('halls')
export class HallsController {
    constructor(private readonly hallsService: HallsService) { }

    @Post()
    create(@Body() data: { eventId: number; name: string; capacity?: number; sortOrder?: number }) {
        return this.hallsService.create(data);
    }

    @Get()
    findAll() {
        return this.hallsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.hallsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<{ name: string; capacity: number; sortOrder: number }>) {
        return this.hallsService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.hallsService.remove(id);
    }
}
