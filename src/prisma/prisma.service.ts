
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();

        // Run migrations automatically on startup (production-safe)
        if (process.env.NODE_ENV !== 'test') {
            try {
                this.logger.log('Running Prisma migrations...');
                const { stdout } = await execAsync('npx prisma migrate deploy', {
                    timeout: 60000, // 60 second timeout
                    env: { ...process.env },
                });
                this.logger.log('Migrations complete: ' + (stdout || 'no output'));
            } catch (err) {
                this.logger.warn('Migration warning (may be already applied): ' + err.message);
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
