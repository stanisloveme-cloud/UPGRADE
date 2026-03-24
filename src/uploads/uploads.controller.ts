import { Controller, Post, Get, Param, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Public } from '../auth/public.decorator';

@Controller('uploads')
export class UploadsController {

    @Post('speaker-photo')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/photos',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                cb(null, uniqueSuffix);
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new BadRequestException('Only JPG/PNG files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    uploadSpeakerPhoto(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('File is required');
        return { url: `/api/uploads/photos/${file.filename}` };
    }

    @Post('logo')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                cb(null, uniqueSuffix);
            }
        }),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'image/png' && file.mimetype !== 'image/svg+xml') {
                return cb(new BadRequestException('Only PNG or SVG files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    uploadLogo(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('File is required');
        return { url: `/api/uploads/logos/${file.filename}` };
    }

    @Public()
    @Post('exact-logo/:filename')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                cb(null, req.params.filename as string);
            }
        })
    }))
    uploadExactLogo(@UploadedFile() file: Express.Multer.File, @Param('filename') filename: string) {
        return { url: `/api/uploads/logos/${filename}` };
    }

    @Post('presentation')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/presentations',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                cb(null, uniqueSuffix);
            }
        }),
        limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(pdf|ppt|pptx)$/i)) {
                return cb(new BadRequestException('Only PDF/PPT/PPTX files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    uploadPresentation(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('File is required');
        return { url: `/api/uploads/presentations/${file.filename}` };
    }

    @Get('photos/:filename')
    servePhoto(@Param('filename') filename: string, @Res() res: Response) {
        return res.sendFile(filename, { root: './uploads/photos' }, (err) => {
            if (err) {
                res.status(404).send('Not found');
            }
        });
    }

    @Get('logos/:filename')
    serveLogo(@Param('filename') filename: string, @Res() res: Response) {
        return res.sendFile(filename, { root: './uploads/logos' }, (err) => {
            if (err) {
                res.status(404).send('Not found');
            }
        });
    }

    @Get('presentations/:filename')
    servePresentation(@Param('filename') filename: string, @Res() res: Response) {
        return res.sendFile(filename, { root: './uploads/presentations' }, (err) => {
            if (err) {
                res.status(404).send('Not found');
            }
        });
    }
}