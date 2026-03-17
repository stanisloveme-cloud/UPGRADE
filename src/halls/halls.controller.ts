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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HallsService } from './halls.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@ApiTags('halls')
@Controller('halls')
export class HallsController {
    constructor(private readonly hallsService: HallsService) { }

    @ApiOperation({ summary: 'Create a new Hall' })
    @Post()
    create(@Body() createHallDto: CreateHallDto) {
        return this.hallsService.create(createHallDto);
    }

    @ApiOperation({ summary: 'Get all Halls' })
    @Get()
    findAll() {
        return this.hallsService.findAll();
    }

    @ApiOperation({ summary: 'Get a specific Hall by ID' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.hallsService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a specific Hall by ID' })
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateHallDto: UpdateHallDto) {
        return this.hallsService.update(id, updateHallDto);
    }

    @ApiOperation({ summary: 'Delete a specific Hall by ID' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.hallsService.remove(id);
    }
}
