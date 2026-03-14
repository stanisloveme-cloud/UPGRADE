import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';

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

    async syncPhotos() {
        const payload = [
            { "name": "Денис Зубов", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/denis-zubov-1330/300-grayscale.webp" },
            { "name": "Полина Росс", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/polina-ross-164/300-grayscale.webp" },
            { "name": "Эдгар Шабанов", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/edgar-sabanov-946/300-grayscale.webp" },
            { "name": "Данил Скворцов", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/danil-skvorcov-1312/300-grayscale.webp" },
            { "name": "Игорь Тарасенко", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/igor-tarasenko-219/300-grayscale.webp" },
            { "name": "Ирина Поддубная", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/irina-poddubnaia-320/300-grayscale.webp" },
            { "name": "Андрей Мелехов", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/andrei-melexov-949/300-grayscale.webp" },
            { "name": "Максим Трухин", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/maksim-truxin-1292/300-grayscale.webp" },
            { "name": "Антон Смирнов", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/anton-smirnov-168/300-grayscale.webp" },
            { "name": "Екатерина Мовсумова", "photoUrl": "https://storage.yandexcloud.net/speaker-photos.upgrade.st/ekaterina-movsumova-744/300-grayscale.webp" }
        ];

        let updatedCount = 0;
        let notFoundCount = 0;
        
        const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'photos');
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

        const downloadPhoto = (url: string, filepath: string): Promise<boolean> => {
            return new Promise((resolve) => {
                https.get(url, (res) => {
                    if (res.statusCode !== 200) return resolve(false);
                    const fileStream = fs.createWriteStream(filepath);
                    res.pipe(fileStream);
                    fileStream.on('finish', () => resolve(true));
                }).on('error', () => resolve(false));
            });
        };

        const allSpeakers = await this.prisma.speaker.findMany();

        for (const item of payload) {
            const nameParts = item.name.toLowerCase().trim().split(/\s+/);
            if (nameParts.length < 2) continue;

            const speaker = allSpeakers.find(s => 
                (s.firstName.toLowerCase().includes(nameParts[0]) && s.lastName.toLowerCase().includes(nameParts[nameParts.length-1])) ||
                (s.firstName.toLowerCase().includes(nameParts[nameParts.length-1]) && s.lastName.toLowerCase().includes(nameParts[0]))
            );

            if (!speaker) {
                notFoundCount++;
                continue;
            }

            const ext = item.photoUrl.split('.').pop() || 'webp';
            const filename = `speaker-${speaker.id}-${uuidv4()}.${ext}`;
            const filepath = path.join(UPLOADS_DIR, filename);
            
            const success = await downloadPhoto(item.photoUrl, filepath);
            if (success) {
                await this.prisma.speaker.update({
                    where: { id: speaker.id },
                    data: { photoUrl: `/api/uploads/photos/${filename}` }
                });
                updatedCount++;
            }
        }
        return { message: 'Sync complete', updated: updatedCount, notFound: notFoundCount };
    }
}
