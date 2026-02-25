import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as xlsx from 'xlsx';
import dayjs from 'dayjs';
import { GoogleGenAI, Type } from '@google/genai';

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

    async importScheduleFromBuffer(buffer: Buffer, eventId: number) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Event not found');

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }

        // 1. Convert Excel Buffer to CSV text
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);

        if (!csvData || csvData.trim() === '') {
            throw new Error('No data found in the Excel file');
        }

        // 2. Initialize Gemini AI
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const schema = {
            type: Type.OBJECT,
            properties: {
                schedule: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            hallName: { type: Type.STRING },
                            trackName: { type: Type.STRING },
                            sessionName: { type: Type.STRING },
                            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                            startTime: { type: Type.STRING, description: "HH:mm format" },
                            endTime: { type: Type.STRING, description: "HH:mm format" },
                            speakers: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        firstName: { type: Type.STRING },
                                        lastName: { type: Type.STRING },
                                        company: { type: Type.STRING },
                                        phone: { type: Type.STRING }
                                    },
                                    required: ["firstName", "lastName"]
                                }
                            }
                        },
                        required: ["hallName", "trackName", "sessionName", "date", "startTime", "endTime"]
                    }
                }
            },
            required: ["schedule"]
        };

        const prompt = `Convert the following schedule table into a strict JSON matching the provided schema. 
If a row lacks a hall, track, or date, infer and inherit it from the previous row above it.
Treat the data natively. Return only the valid JSON object.

CSV Data:
${csvData}`;

        // 3. Generate Structured Output JSON
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            }
        });

        if (!response.text) {
            throw new Error('No valid output text from Gemini');
        }

        let parsedData;
        try {
            parsedData = JSON.parse(response.text);
        } catch (err) {
            throw new Error('Failed to parse the Gemini JSON response');
        }

        const scheduleItems = parsedData.schedule || [];

        // 4. Save to Database using Transaction
        let sessionsCreated = 0;
        await this.prisma.$transaction(async (tx) => {
            for (const item of scheduleItems) {
                // Find or create Hall
                let hall = await tx.hall.findFirst({ where: { eventId, name: item.hallName } });
                if (!hall) {
                    hall = await tx.hall.create({ data: { name: item.hallName, eventId, capacity: 100 } });
                }

                // Parse Date (ensure JS Date object)
                const parsedDate = dayjs(item.date, "YYYY-MM-DD").toDate();

                // Find or create Track
                let track = await tx.track.findFirst({ where: { hallId: hall.id, name: item.trackName, day: parsedDate } });
                if (!track) {
                    track = await tx.track.create({
                        data: {
                            name: item.trackName,
                            hallId: hall.id,
                            day: parsedDate,
                            startTime: item.startTime,
                            endTime: item.endTime
                        }
                    });
                }

                // Create Session
                const session = await tx.session.create({
                    data: {
                        name: item.sessionName,
                        trackId: track.id,
                        startTime: item.startTime,
                        endTime: item.endTime
                    }
                });
                sessionsCreated++;

                // Assign Speakers
                if (item.speakers && item.speakers.length > 0) {
                    let sortOrder = 0;
                    for (const spk of item.speakers) {
                        if (!spk.firstName || !spk.lastName) continue;

                        let speaker = await tx.speaker.findFirst({
                            where: { firstName: spk.firstName, lastName: spk.lastName }
                        });

                        if (!speaker) {
                            speaker = await tx.speaker.create({
                                data: {
                                    firstName: spk.firstName,
                                    lastName: spk.lastName,
                                    company: spk.company || null,
                                    phone: spk.phone || null
                                }
                            });
                        }

                        await tx.sessionSpeaker.create({
                            data: {
                                sessionId: session.id,
                                speakerId: speaker.id,
                                role: 'speaker',
                                sortOrder: sortOrder++
                            }
                        });
                    }
                }
            }
        });

        return { success: true, sessionsImported: sessionsCreated };
    }
}
