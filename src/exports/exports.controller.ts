import { Controller, Get, Param, ParseIntPipe, Res, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExportsService } from './exports.service';
import type { Response } from 'express';

@Controller('exports')
export class ExportsController {
    constructor(private readonly exportsService: ExportsService) { }

    @Get('schedule/:eventId')
    async exportSchedule(
        @Param('eventId', ParseIntPipe) eventId: number,
        @Res() res: Response
    ) {
        const buffer = await this.exportsService.exportSchedule(eventId);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=Event_${eventId}_Schedule.xlsx`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Post('import/:eventId')
    @UseInterceptors(FileInterceptor('file'))
    async importSchedule(
        @Param('eventId', ParseIntPipe) eventId: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const result = await this.exportsService.importScheduleFromBuffer(file.buffer, eventId);
        return { message: 'Import successful', ...result };
    }
}
