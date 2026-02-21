import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';

@Injectable()
export class ExportsService {
    constructor(private readonly prisma: PrismaService) { }

    async exportSchedule(eventId: number): Promise<Buffer> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                halls: {
                    include: {
                        tracks: {
                            include: {
                                sessions: {
                                    include: {
                                        speakers: {
                                            include: { speaker: true },
                                            orderBy: { sortOrder: 'asc' }
                                        }
                                    },
                                    orderBy: { startTime: 'asc' }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!event) throw new NotFoundException('Event not found');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'UPGRADE CRM';

        const worksheet = workbook.addWorksheet('Расписание');

        worksheet.columns = [
            { header: 'Дата', key: 'date', width: 15 },
            { header: 'Зал', key: 'hall', width: 20 },
            { header: 'Трек', key: 'track', width: 30 },
            { header: 'Время', key: 'time', width: 15 },
            { header: 'Название сессии', key: 'session', width: 50 },
            { header: 'Спикеры', key: 'speakers', width: 80 }
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

        event.halls.forEach(hall => {
            hall.tracks.forEach(track => {
                const dateStr = track.day ? dayjs(track.day).format('DD.MM.YYYY') : '';
                track.sessions.forEach(session => {
                    const speakersText = session.speakers.map(ss => {
                        const role = ss.role === 'moderator' ? '[Модератор]' : '';
                        const name = `${ss.speaker.firstName} ${ss.speaker.lastName}`;
                        const company = ss.companySnapshot ? `(${ss.companySnapshot})` : '';
                        return `${role} ${name} ${company}`.trim();
                    }).join(', ');

                    worksheet.addRow({
                        date: dateStr,
                        hall: hall.name,
                        track: track.name,
                        time: `${session.startTime} - ${session.endTime}`,
                        session: session.name,
                        speakers: speakersText
                    });
                });
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
