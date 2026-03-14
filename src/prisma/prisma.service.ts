
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
                
                // --- HOTFIX FOR FAILED MIGRATION ---
                // The DevStand db already has 20260314155000 marked as aborted/failed.
                // We resolve it as rolled back so the corrected migration can be applied.
                try {
                    this.logger.log('Attempting to resolve previously failed migration...');
                    await execAsync('npx prisma migrate resolve --rolled-back 20260314155000_add_event_location_and_logo', {
                        env: { ...process.env },
                    });
                    this.logger.log('Migration resolve successful.');
                } catch (resolveErr) {
                    this.logger.log('Migration resolve not needed or failed (safe to ignore): ' + resolveErr.message);
                }
                // --- END HOTFIX ---

                const { stdout } = await execAsync('npx prisma migrate deploy', {
                    timeout: 60000, // 60 second timeout
                    env: { ...process.env },
                });
                this.logger.log('Migrations complete: ' + (stdout || 'no output'));

                await this.seedAdminUser();
            } catch (err) {
                this.logger.warn('Migration warning (may be already applied): ' + err.message);

                await this.seedAdminUser();
            }
        }
    }

    private async seedAdminUser() {
        try {
            const adminUser = 'admin';
            const existingAdmin = await this.user.findUnique({ where: { username: adminUser } });
            if (!existingAdmin) {
                this.logger.log('Seeding MVP admin user...');
                await this.user.create({
                    data: {
                        username: adminUser,
                        password: 'admin123',
                        role: 'admin',
                        isSuperAdmin: true,
                    },
                });
                this.logger.log('MVP admin user created successfully.');
            }
        } catch (err) {
            this.logger.error('Failed to seed admin user: ' + err.message);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
