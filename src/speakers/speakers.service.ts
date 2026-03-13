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
                let existing: any[] = [];
                if (ls.email) {
                    existing = await this.prisma.$queryRaw`SELECT id, email, phone, telegram, position FROM "Speaker" WHERE email = ${ls.email} LIMIT 1`;
                }
                if (existing.length === 0 && ls.phone) {
                    existing = await this.prisma.$queryRaw`SELECT id, email, phone, telegram, position FROM "Speaker" WHERE phone = ${ls.phone} LIMIT 1`;
                }
                if (existing.length === 0 && ls.name && ls.surname) {
                    existing = await this.prisma.$queryRaw`SELECT id, email, phone, telegram, position FROM "Speaker" WHERE first_name = ${ls.name} AND last_name = ${ls.surname} LIMIT 1`;
                }

                if (existing.length > 0) {
                    const row = existing[0];
                    const position = row.position || (ls.details ? ls.details.substring(0, 255) : null);
                    const email = row.email || (ls.email ? ls.email.substring(0, 255) : null);
                    const phone = row.phone || (ls.phone ? ls.phone.substring(0, 50) : null);
                    const telegram = row.telegram || (ls.telegram ? ls.telegram.substring(0, 100) : null);

                    await this.prisma.$executeRaw`
                        UPDATE "Speaker"
                        SET position = ${position}, email = ${email}, phone = ${phone}, telegram = ${telegram}
                        WHERE id = ${row.id}
                    `;
                    updated++;
                } else {
                    const firstName = ls.name;
                    const lastName = ls.surname || '';
                    const position = ls.details ? ls.details.substring(0, 255) : null;
                    const email = ls.email ? ls.email.substring(0, 255) : null;
                    const phone = ls.phone ? ls.phone.substring(0, 50) : null;
                    const telegram = ls.telegram ? ls.telegram.substring(0, 100) : null;

                    await this.prisma.$executeRaw`
                        INSERT INTO "Speaker" (first_name, last_name, position, email, phone, telegram)
                        VALUES (${firstName}, ${lastName}, ${position}, ${email}, ${phone}, ${telegram})
                    `;
                    added++;
                }
            }
            return { message: 'Speakers import complete', totalScraped: speakersData.length, added, updated };
        } catch (e: any) {
            return { error: e.message || e.toString(), stack: e.stack };
        }
    }
}
