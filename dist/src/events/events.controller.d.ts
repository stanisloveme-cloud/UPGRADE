import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    getFullStructure(id: number): Promise<{
        halls: ({
            tracks: ({
                sessions: ({
                    briefings: {
                        link: string | null;
                        datetime: Date;
                        id: number;
                        sessionId: number;
                        moderatorId: number | null;
                        isDone: boolean;
                        comment: string | null;
                    }[];
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
                        id: number;
                        status: import("@prisma/client").$Enums.SpeakerStatus;
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
                } & {
                    comments: string | null;
                    id: number;
                    name: string;
                    description: string | null;
                    startTime: string;
                    endTime: string;
                    trackId: number;
                    clients: string | null;
                })[];
            } & {
                id: number;
                name: string;
                description: string | null;
                sortOrder: number;
                startTime: string;
                hallId: number;
                day: Date;
                endTime: string;
            })[];
        } & {
            id: number;
            name: string;
            sortOrder: number;
            eventId: number;
            capacity: number;
        })[];
    } & {
        id: number;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.EventStatus;
        createdAt: Date;
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.EventStatus;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.EventStatus;
        createdAt: Date;
    }[]>;
}
