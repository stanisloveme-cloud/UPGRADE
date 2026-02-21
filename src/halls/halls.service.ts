import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@Injectable()
export class HallsService {
    constructor(private readonly prisma: PrismaService) { }

    create(createHallDto: CreateHallDto) {
        return this.prisma.hall.create({ data: createHallDto });
    }

    findAll() {
        return this.prisma.hall.findMany({ orderBy: { sortOrder: 'asc' } });
    }

    async findOne(id: number) {
        const hall = await this.prisma.hall.findUnique({ where: { id } });
        if (!hall) throw new NotFoundException(`Hall #${id} not found`);
        return hall;
    }

    update(id: number, updateHallDto: UpdateHallDto) {
        return this.prisma.hall.update({ where: { id }, data: updateHallDto });
    }

    remove(id: number) {
        return this.prisma.hall.delete({ where: { id } });
    }
}
