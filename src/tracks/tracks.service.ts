import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TracksService {
    constructor(private readonly prisma: PrismaService) { }

    create(data: { hallId: number; name: string; day: string; startTime: string; endTime: string; sortOrder?: number }) {
        return this.prisma.track.create({
            data: { ...data, day: new Date(data.day) },
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

    update(id: number, data: Partial<{ name: string; startTime: string; endTime: string }>) {
        return this.prisma.track.update({ where: { id }, data });
    }

    remove(id: number) {
        return this.prisma.track.delete({ where: { id } });
    }
}
