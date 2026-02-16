import { PrismaService } from '../prisma/prisma.service';
export declare class HallsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        eventId: number;
        name: string;
        capacity?: number;
        sortOrder?: number;
    }): import("@prisma/client").Prisma.Prisma__HallClient<{
        name: string;
        id: number;
        capacity: number;
        sortOrder: number;
        eventId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: number;
        capacity: number;
        sortOrder: number;
        eventId: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        id: number;
        capacity: number;
        sortOrder: number;
        eventId: number;
    }>;
    update(id: number, data: Partial<{
        name: string;
        capacity: number;
        sortOrder: number;
    }>): import("@prisma/client").Prisma.Prisma__HallClient<{
        name: string;
        id: number;
        capacity: number;
        sortOrder: number;
        eventId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__HallClient<{
        name: string;
        id: number;
        capacity: number;
        sortOrder: number;
        eventId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
