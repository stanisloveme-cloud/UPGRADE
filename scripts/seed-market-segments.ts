import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import segmentsData from './market_segments.json';

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding Market Segments...');

    // Clear existing segments and relations
    await prisma.sponsorSegment.deleteMany();
    await prisma.marketSegment.deleteMany();

    console.log('Cleared existing market segments.');

    async function createSegment(node: any, parentId?: number) {
        const created = await prisma.marketSegment.create({
            data: {
                name: node.name,
                parentId: parentId || null,
            }
        });

        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                await createSegment(child, created.id);
            }
        }
    }

    for (const topLevel of segmentsData) {
        await createSegment(topLevel);
        console.log(`✅ Seeded tree for: ${topLevel.name}`);
    }

    console.log('Market Segments seeded successfully!');
}

main()
    .catch(e => {
        console.error('Error seeding market segments:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
