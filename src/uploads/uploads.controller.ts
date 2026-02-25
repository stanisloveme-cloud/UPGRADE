import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
}