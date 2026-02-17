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
    } & {
        comments: string | null;
        id: number;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        trackId: number;
        clients: string | null;
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
    } & {
        comments: string | null;
        id: number;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        trackId: number;
        clients: string | null;
    })[]>;
    findOne(id: number): Promise<{
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
    } & {
        comments: string | null;
        id: number;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        trackId: number;
        clients: string | null;
    }>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__SessionClient<{
        comments: string | null;
        id: number;
        name: string;
        description: string | null;
        startTime: string;
        endTime: string;
        trackId: number;
        clients: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
