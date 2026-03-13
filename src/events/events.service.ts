import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(user?: any) {
        if (!user || user.isSuperAdmin) {
            return this.prisma.event.findMany({
                orderBy: { startDate: 'desc' },
            });
        }

        return this.prisma.event.findMany({
            where: {
                users: {
                    some: { userId: user.id }
                }
            },
            orderBy: { startDate: 'desc' },
        });
    }

    async create(data: any) {
        const newEvent = await this.prisma.event.create({
            data: {
                name: data.name,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: 'draft',
            },
        });

        // Auto-assign new event to all active managers
        const activeManagers = await this.prisma.user.findMany({
            where: { isActive: true, isSuperAdmin: false }
        });

        if (activeManagers.length > 0) {
            await this.prisma.userEvent.createMany({
                data: activeManagers.map(m => ({
                    userId: m.id,
                    eventId: newEvent.id
                }))
            });
        }

        return newEvent;
    }

    async findOne(id: number, user?: any) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) throw new NotFoundException(`Event #${id} not found`);

        if (user && !user.isSuperAdmin) {
            const hasAccess = await this.prisma.userEvent.findUnique({
                where: { userId_eventId: { userId: user.id, eventId: id } }
            });
            if (!hasAccess) throw new NotFoundException(`Event #${id} not found or access denied`);
        }

        return event;
    }

    async update(id: number, updateData: any, user?: any) {
        // findOne already checks access
        const event = await this.findOne(id, user);

        return this.prisma.event.update({
            where: { id },
            data: {
                name: updateData.name,
                description: updateData.description,
                startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
                endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
            }
        });
    }

    async remove(id: number, user?: any) {
        if (!user || !user.isSuperAdmin) {
            throw new NotFoundException(`Access denied. Only SuperAdmins can delete events.`);
        }
        
        // Explicit check if it exists
        await this.prisma.event.findUniqueOrThrow({ where: { id } });

        return this.prisma.event.delete({ where: { id } });
    }

    async getFullStructure(id: number, user?: any) {
        try {
            if (user && !user.isSuperAdmin) {
                const hasAccess = await this.prisma.userEvent.findUnique({
                    where: { userId_eventId: { userId: user.id, eventId: id } }
                });
                if (!hasAccess) throw new NotFoundException(`Event #${id} not found or access denied`);
            }
            console.log(`Fetching full structure for event ${id}...`);
            const event = await this.prisma.event.findUnique({
                where: { id },
                include: {
                    halls: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            tracks: {
                                orderBy: { sortOrder: 'asc' },
                                include: {
                                    sessions: {
                                        orderBy: { startTime: 'asc' },
                                        include: {
                                            speakers: {
                                                orderBy: { sortOrder: 'asc' },
                                                include: { speaker: true },
                                            },
                                            questions: { orderBy: { order: 'asc' } },
                                            briefings: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!event) {
                console.warn(`Event ${id} not found`);
                throw new NotFoundException(`Event #${id} not found`);
            }
            console.log(`Successfully fetched event ${id}: ${event.name}`);
            return event;
        } catch (error) {
            console.error('Error in getFullStructure:', error);
            throw error;
        }
    }

    async getSessionSpeakers(eventId: number) {
        return this.prisma.sessionSpeaker.findMany({
            where: {
                session: {
                    track: {
                        hall: {
                            eventId
                        }
                    }
                }
            },
            include: {
                speaker: true,
                session: {
                    include: {
                        track: {
                            include: {
                                hall: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { sortOrder: 'asc' },
                { id: 'asc' }
            ]
        });
    }

    async updateSessionSpeakersSort(eventId: number, updates: { id: number, sortOrder: number }[]) {
        const transactions = updates.map(update =>
            this.prisma.sessionSpeaker.update({
                where: { id: update.id },
                data: { sortOrder: update.sortOrder }
            })
        );
        await this.prisma.$transaction(transactions);
        return { success: true };
    }

    async getAnnouncements(eventId: number) {
        return this.prisma.track.findMany({
            where: {
                hall: {
                    eventId
                }
            },
            include: {
                hall: true
            },
            orderBy: [
                { hall: { sortOrder: 'asc' } },
                { sortOrder: 'asc' }
            ]
        });
    }

    async updateAnnouncements(eventId: number, updates: any[]) {
        const transactions = updates.map(update =>
            this.prisma.track.update({
                where: { id: update.id },
                data: {
                    materialType: update.materialType,
                    readyDate: update.readyDate ? new Date(update.readyDate) : null,
                    status: update.status,
                    materialLink: update.materialLink
                }
            })
        );
        await this.prisma.$transaction(transactions);
        return { success: true };
    }

    async getMemoTemplate(eventId: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { memoTemplate: true }
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    async updateMemoTemplate(eventId: number, template: string) {
        return this.prisma.event.update({
            where: { id: eventId },
            data: { memoTemplate: template }
        });
    }

    async updateSessionSpeaker(id: number, data: any) {
        return this.prisma.sessionSpeaker.update({
            where: { id },
            data: {
                notifiedTg: data.notifiedTg,
                notifiedEmail: data.notifiedEmail,
            }
        });
    }

    async getPublicSpeakerMemo(hash: string) {
        const sessionSpeaker = await this.prisma.sessionSpeaker.findUnique({
            where: { memoHash: hash },
            include: {
                speaker: true,
                session: {
                    include: {
                        track: {
                            include: {
                                hall: {
                                    include: {
                                        event: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!sessionSpeaker) throw new NotFoundException('Memo not found');

        const event = sessionSpeaker.session.track.hall.event;
        const template = event.memoTemplate || '<h1>Памятка спикера</h1><p>Уважаемый(ая) {{name}}, ждем вас на мероприятии {{eventName}}!</p><p>Сессия: {{sessionName}} в {{startTime}}, Зал: {{hallName}}.</p>';

        let html = template
            .replace(/{{name}}/g, `${sessionSpeaker.speaker.firstName} ${sessionSpeaker.speaker.lastName}`)
            .replace(/{{sessionName}}/g, sessionSpeaker.session.name)
            .replace(/{{hallName}}/g, sessionSpeaker.session.track.hall.name)
            .replace(/{{startTime}}/g, sessionSpeaker.session.startTime)
            .replace(/{{eventName}}/g, event.name);

        return { html, eventName: event.name, speakerName: `${sessionSpeaker.speaker.firstName} ${sessionSpeaker.speaker.lastName}` };
    }

    async downloadPresentationsZip(eventId: number, res: any) {
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
                                            include: {
                                                speaker: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }) as any;

        if (!event) throw new NotFoundException('Event not found');

        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="presentations-${eventId}.zip"`,
        });

        archive.pipe(res);

        const fs = require('fs');
        const path = require('path');
        const axios = require('axios');

        for (const hall of event.halls) {
            for (const track of hall.tracks) {
                for (const session of track.sessions) {
                    for (const sessionSpeaker of session.speakers) {
                        if (sessionSpeaker.presentationUrl) {
                            const url = sessionSpeaker.presentationUrl;
                            const folderName = `${hall.name}/${track.name}/${session.name}`;
                            // safe folder name replacement removing slashes
                            const safeFolderName = folderName.replace(/[\/\\]/g, '-').replace(/:/g, '');
                            const fileName = `${sessionSpeaker.speaker.firstName}_${sessionSpeaker.speaker.lastName}_presentation`;

                            if (url.startsWith('http')) {
                                try {
                                    const response = await axios({
                                        method: 'get',
                                        url: url,
                                        responseType: 'stream'
                                    });
                                    let ext = '.pdf';
                                    if (response.headers['content-type'] === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') ext = '.pptx';
                                    archive.append(response.data, { name: `${safeFolderName}/${fileName}${ext}` });
                                } catch (e) {
                                    console.error(`Failed to fetch ${url}`, e);
                                }
                            } else {
                                const localPath = path.join(process.cwd(), url.startsWith('/') ? url.substring(1) : url);
                                if (fs.existsSync(localPath)) {
                                    const ext = path.extname(localPath) || '.pdf';
                                    archive.file(localPath, { name: `${safeFolderName}/${fileName}${ext}` });
                                }
                            }
                        }
                    }
                }
            }
        }

        await archive.finalize();
    }
}
