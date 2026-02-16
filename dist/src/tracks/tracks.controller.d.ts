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
        name: string;
        description: string | null;
        id: number;
        sortOrder: number;
        day: Date;
        startTime: string;
        endTime: string;
        hallId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        description: string | null;
        id: number;
        sortOrder: number;
        day: Date;
        startTime: string;
        endTime: string;
        hallId: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        description: string | null;
        id: number;
        sortOrder: number;
        day: Date;
        startTime: string;
        endTime: string;
        hallId: number;
    }>;
    update(id: number, data: Partial<{
        name: string;
        startTime: string;
        endTime: string;
    }>): import("@prisma/client").Prisma.Prisma__TrackClient<{
        name: string;
        description: string | null;
        id: number;
        sortOrder: number;
        day: Date;
        startTime: string;
        endTime: string;
        hallId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__TrackClient<{
        name: string;
        description: string | null;
        id: number;
        sortOrder: number;
        day: Date;
        startTime: string;
        endTime: string;
        hallId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
