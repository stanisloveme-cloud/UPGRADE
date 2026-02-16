import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HallsService {
    constructor(private readonly prisma: PrismaService) { }

    create(data: { eventId: number; name: string; capacity?: number; sortOrder?: number }) {
        return this.prisma.hall.create({ data });
    }

    findAll() {
        return this.prisma.hall.findMany({ orderBy: { sortOrder: 'asc' } });
    }

    async findOne(id: number) {
        const hall = await this.prisma.hall.findUnique({ where: { id } });
        if (!hall) throw new NotFoundException(`Hall #${id} not found`);
        return hall;
    }

    update(id: number, data: Partial<{ name: string; capacity: number; sortOrder: number }>) {
        return this.prisma.hall.update({ where: { id }, data });
    }

    remove(id: number) {
        return this.prisma.hall.delete({ where: { id } });
    }
}
