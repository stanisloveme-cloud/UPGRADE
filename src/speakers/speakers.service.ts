import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import * as fs from 'fs';
import * as path from 'path';

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

    async importLegacy() {
        try {
            const filePath = path.join(process.cwd(), 'scripts', 'scraped_speakers.json');
            if (!fs.existsSync(filePath)) {
                return { error: 'Scraped JSON file not found. Run the scraper first.' };
            }

            const speakersData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let added = 0;
            let updated = 0;

            for (const ls of speakersData) {
                let existing = null;
                if (ls.email) {
                    existing = await this.prisma.speaker.findFirst({ where: { email: ls.email } });
                }
                if (!existing && ls.phone) {
                    existing = await this.prisma.speaker.findFirst({ where: { phone: ls.phone } });
                }
                if (!existing && ls.name && ls.surname) {
                    existing = await this.prisma.speaker.findFirst({
                        where: { firstName: ls.name, lastName: ls.surname }
                    });
                }

                const data = {
                    firstName: ls.name,
                    lastName: ls.surname || '',
                    position: ls.details ? ls.details.substring(0, 255) : null,
                    email: ls.email ? ls.email.substring(0, 255) : null,
                    phone: ls.phone ? ls.phone.substring(0, 50) : null,
                    telegram: ls.telegram ? ls.telegram.substring(0, 100) : null,
                };

                if (existing) {
                    await this.prisma.speaker.update({
                        where: { id: existing.id },
                        data: {
                            position: existing.position || data.position,
                            email: existing.email || data.email,
                            phone: existing.phone || data.phone,
                            telegram: existing.telegram || data.telegram,
                        }
                    });
                    updated++;
                } else {
                    await this.prisma.speaker.create({ data });
                    added++;
                }
            }
            return { message: 'Speakers import complete', totalScraped: speakersData.length, added, updated };
        } catch (e: any) {
            return { error: e.message || e.toString(), stack: e.stack };
        }
    }
}
