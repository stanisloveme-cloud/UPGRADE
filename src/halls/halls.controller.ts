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
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@Controller('halls')
export class HallsController {
    constructor(private readonly hallsService: HallsService) { }

    @Post()
    create(@Body() createHallDto: CreateHallDto) {
        return this.hallsService.create(createHallDto);
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
    update(@Param('id', ParseIntPipe) id: number, @Body() updateHallDto: UpdateHallDto) {
        return this.hallsService.update(id, updateHallDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.hallsService.remove(id);
    }
}
