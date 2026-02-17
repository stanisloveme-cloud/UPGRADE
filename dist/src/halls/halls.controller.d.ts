import { HallsService } from './halls.service';
export declare class HallsController {
    private readonly hallsService;
    constructor(hallsService: HallsService);
    create(data: {
        eventId: number;
        name: string;
        capacity?: number;
        sortOrder?: number;
    }): import("@prisma/client").Prisma.Prisma__HallClient<{
        id: number;
        name: string;
        sortOrder: number;
        eventId: number;
        capacity: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        sortOrder: number;
        eventId: number;
        capacity: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        sortOrder: number;
        eventId: number;
        capacity: number;
    }>;
    update(id: number, data: Partial<{
        name: string;
        capacity: number;
        sortOrder: number;
    }>): import("@prisma/client").Prisma.Prisma__HallClient<{
        id: number;
        name: string;
        sortOrder: number;
        eventId: number;
        capacity: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__HallClient<{
        id: number;
        name: string;
        sortOrder: number;
        eventId: number;
        capacity: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
