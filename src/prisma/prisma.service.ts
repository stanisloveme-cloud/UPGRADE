
import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;

    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined');
        }

        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        // Pass the adapter to the parent constructor
        // Using 'as any' to bypass strict type definition if necessary, 
        // as we verified this works at runtime.
        super({ adapter } as any);

        this.pool = pool;
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        // Disconnect Prisma client first
        await this.$disconnect();
        // Then close the pool
        await this.pool.end();
    }
}
