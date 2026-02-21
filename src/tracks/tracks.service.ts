import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
    constructor(private readonly prisma: PrismaService) { }

    create(createTrackDto: CreateTrackDto) {
        return this.prisma.track.create({
            data: { ...createTrackDto, day: new Date(createTrackDto.day) },
        });
    }

    findAll() {
        return this.prisma.track.findMany({ orderBy: { sortOrder: 'asc' } });
    }

    async findOne(id: number) {
        const track = await this.prisma.track.findUnique({ where: { id } });
        if (!track) throw new NotFoundException(`Track #${id} not found`);
        return track;
    }

    update(id: number, updateTrackDto: UpdateTrackDto) {
        return this.prisma.track.update({ where: { id }, data: updateTrackDto });
    }

    remove(id: number) {
        return this.prisma.track.delete({ where: { id } });
    }
}
