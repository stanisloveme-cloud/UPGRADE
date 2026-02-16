import { PrismaService } from '../prisma/prisma.service';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.EventStatus;
        createdAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.EventStatus;
        createdAt: Date;
        id: number;
    }>;
    getFullStructure(id: number): Promise<{
        halls: ({
            tracks: ({
                sessions: ({
                    speakers: ({
                        speaker: {
                            id: number;
                            firstName: string;
                            lastName: string;
                            company: string | null;
                            position: string | null;
                            email: string | null;
                            phone: string | null;
                            telegram: string | null;
                            photoUrl: string | null;
                            isSponsor: boolean;
                            bio: string | null;
                            internalComment: string | null;
                        };
                    } & {
                        status: import("@prisma/client").$Enums.SpeakerStatus;
                        id: number;
                        sortOrder: number;
                        sessionId: number;
                        speakerId: number;
                        role: import("@prisma/client").$Enums.SpeakerRole;
                        statusDate: Date | null;
                        needsZoom: boolean;
                        hasPresentation: boolean;
                        managerComment: string | null;
                        programThesis: string | null;
                        newsletterQuote: string | null;
                        presenceStatus: import("@prisma/client").$Enums.PresenceStatus | null;
                    })[];
                    questions: {
                        id: number;
                        order: number;
                        sessionId: number;
                        title: string;
                        body: string | null;
                    }[];
                    briefings: {
                        datetime: Date;
                        id: number;
                        link: string | null;
                        sessionId: number;
                        moderatorId: number | null;
                        isDone: boolean;
                        comment: string | null;
                    }[];
                } & {
                    comments: string | null;
                    name: string;
                    description: string | null;
                    id: number;
                    startTime: string;
                    endTime: string;
                    clients: string | null;
                    trackId: number;
                })[];
            } & {
                name: string;
                description: string | null;
                id: number;
                sortOrder: number;
                day: Date;
                startTime: string;
                endTime: string;
                hallId: number;
            })[];
        } & {
            name: string;
            id: number;
            capacity: number;
            sortOrder: number;
            eventId: number;
        })[];
    } & {
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.EventStatus;
        createdAt: Date;
        id: number;
    }>;
}
