import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';

@Injectable()
export class SpeakersService {
    constructor(private readonly prisma: PrismaService) { }

    create(createSpeakerDto: CreateSpeakerDto) {
        return this.prisma.speaker.create({
            data: createSpeakerDto,
        });
    }

    findAll() {
        return this.prisma.speaker.findMany({
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
        });
    }

    async findOne(id: number) {
        const speaker = await this.prisma.speaker.findUnique({
            where: { id },
            include: {
                sessions: { include: { session: true } },
                // @ts-ignore
                ratings: { include: { event: true }, orderBy: { createdAt: 'desc' } }
            },
        });
        if (!speaker) throw new NotFoundException(`Speaker #${id} not found`);
        return speaker;
    }

    update(id: number, updateSpeakerDto: UpdateSpeakerDto) {
        return this.prisma.speaker.update({ where: { id }, data: updateSpeakerDto });
    }

    remove(id: number) {
        return this.prisma.speaker.delete({ where: { id } });
    }
}
