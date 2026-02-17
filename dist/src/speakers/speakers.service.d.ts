import { PrismaService } from '../prisma/prisma.service';
export declare class SpeakersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        firstName: string;
        lastName: string;
        company?: string;
        position?: string;
        email?: string;
    }): import("@prisma/client").Prisma.Prisma__SpeakerClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(id: number): Promise<{
        sessions: ({
            session: {
                comments: string | null;
                id: number;
                name: string;
                description: string | null;
                startTime: string;
                endTime: string;
                trackId: number;
                clients: string | null;
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
    }>;
    update(id: number, data: Partial<{
        firstName: string;
        lastName: string;
        company: string;
        position: string;
    }>): import("@prisma/client").Prisma.Prisma__SpeakerClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__SpeakerClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
