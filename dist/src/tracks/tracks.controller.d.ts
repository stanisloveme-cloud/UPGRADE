import { TracksService } from './tracks.service';
export declare class TracksController {
    private readonly tracksService;
    constructor(tracksService: TracksService);
    create(data: {
        hallId: number;
        name: string;
        day: string;
        startTime: string;
        endTime: string;
        sortOrder?: number;
    }): import("@prisma/client").Prisma.Prisma__TrackClient<{
        id: number;
        name: string;
        description: string | null;
        sortOrder: number;
        startTime: string;
        hallId: number;
        day: Date;
        endTime: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        description: string | null;
        sortOrder: number;
        startTime: string;
        hallId: number;
        day: Date;
        endTime: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        sortOrder: number;
        startTime: string;
        hallId: number;
        day: Date;
        endTime: string;
    }>;
    update(id: number, data: Partial<{
        name: string;
        startTime: string;
        endTime: string;
    }>): import("@prisma/client").Prisma.Prisma__TrackClient<{
        id: number;
        name: string;
        description: string | null;
        sortOrder: number;
        startTime: string;
        hallId: number;
        day: Date;
        endTime: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__TrackClient<{
        id: number;
        name: string;
        description: string | null;
        sortOrder: number;
        startTime: string;
        hallId: number;
        day: Date;
        endTime: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
