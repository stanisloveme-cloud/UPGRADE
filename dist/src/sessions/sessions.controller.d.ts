import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(data: {
        trackId: number;
        name: string;
        startTime: string;
        endTime: string;
        description?: string;
        speakerIds?: number[];
    }): Promise<{
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
            role: import("@prisma/client").$Enums.SpeakerRole;
            status: import("@prisma/client").$Enums.SpeakerStatus;
            statusDate: Date | null;
            sortOrder: number;
            needsZoom: boolean;
            hasPresentation: boolean;
            managerComment: string | null;
            programThesis: string | null;
            newsletterQuote: string | null;
            presenceStatus: import("@prisma/client").$Enums.PresenceStatus | null;
            speakerId: number;
            sessionId: number;
        })[];
    } & {
        comments: string | null;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        clients: string | null;
        id: number;
        trackId: number;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
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
            role: import("@prisma/client").$Enums.SpeakerRole;
            status: import("@prisma/client").$Enums.SpeakerStatus;
            statusDate: Date | null;
            sortOrder: number;
            needsZoom: boolean;
            hasPresentation: boolean;
            managerComment: string | null;
            programThesis: string | null;
            newsletterQuote: string | null;
            presenceStatus: import("@prisma/client").$Enums.PresenceStatus | null;
            speakerId: number;
            sessionId: number;
        })[];
    } & {
        comments: string | null;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        clients: string | null;
        id: number;
        trackId: number;
    })[]>;
    findOne(id: number): Promise<{
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
            role: import("@prisma/client").$Enums.SpeakerRole;
            status: import("@prisma/client").$Enums.SpeakerStatus;
            statusDate: Date | null;
            sortOrder: number;
            needsZoom: boolean;
            hasPresentation: boolean;
            managerComment: string | null;
            programThesis: string | null;
            newsletterQuote: string | null;
            presenceStatus: import("@prisma/client").$Enums.PresenceStatus | null;
            speakerId: number;
            sessionId: number;
        })[];
        questions: {
            id: number;
            sessionId: number;
            order: number;
            title: string;
            body: string | null;
        }[];
        briefings: {
            id: number;
            link: string | null;
            sessionId: number;
            moderatorId: number | null;
            datetime: Date;
            isDone: boolean;
            comment: string | null;
        }[];
    } & {
        comments: string | null;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        clients: string | null;
        id: number;
        trackId: number;
    }>;
    update(id: number, data: Partial<{
        name: string;
        startTime: string;
        endTime: string;
        description: string;
        speakerIds: number[];
    }>): Promise<{
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
            role: import("@prisma/client").$Enums.SpeakerRole;
            status: import("@prisma/client").$Enums.SpeakerStatus;
            statusDate: Date | null;
            sortOrder: number;
            needsZoom: boolean;
            hasPresentation: boolean;
            managerComment: string | null;
            programThesis: string | null;
            newsletterQuote: string | null;
            presenceStatus: import("@prisma/client").$Enums.PresenceStatus | null;
            speakerId: number;
            sessionId: number;
        })[];
    } & {
        comments: string | null;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        clients: string | null;
        id: number;
        trackId: number;
    }>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__SessionClient<{
        comments: string | null;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        clients: string | null;
        id: number;
        trackId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
