import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarketSegmentsService } from './market-segments.service';

@Controller('market-segments')
export class MarketSegmentsController {
    constructor(private readonly marketSegmentsService: MarketSegmentsService) { }

    @Get('tree')
    getTree() {
        return this.marketSegmentsService.getSegmentTree();
    }

    @Get()
    findAll() {
        return this.marketSegmentsService.findAll();
    }

    @Post()
    create(@Body() createDto: { name: string; parentId?: number }) {
        return this.marketSegmentsService.create(createDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: { name?: string; parentId?: number }) {
        return this.marketSegmentsService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.marketSegmentsService.remove(+id);
    }
}
