import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpeakersService {
    constructor(private readonly prisma: PrismaService) { }

    create(data: { firstName: string; lastName: string; company?: string; position?: string; email?: string }) {
        return this.prisma.speaker.create({ data });
    }

    findAll() {
        return this.prisma.speaker.findMany({ orderBy: { lastName: 'asc' } });
    }

    async findOne(id: number) {
        const speaker = await this.prisma.speaker.findUnique({
            where: { id },
            include: { sessions: { include: { session: true } } },
        });
        if (!speaker) throw new NotFoundException(`Speaker #${id} not found`);
        return speaker;
    }

    update(id: number, data: Partial<{ firstName: string; lastName: string; company: string; position: string }>) {
        return this.prisma.speaker.update({ where: { id }, data });
    }

    remove(id: number) {
        return this.prisma.speaker.delete({ where: { id } });
    }
}
