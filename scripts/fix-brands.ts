import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting script to revert all imported Brands statuses to 'pending'...");

    const updated = await prisma.sponsor.updateMany({
        where: {
            status: 'approved',
            exportToWebsite: true // Broad heuristic for imported ones, or we can just update ALL since User stated "all"
        },
        data: {
            status: 'pending'
        }
    });

    console.log(`Successfully updated ${updated.count} brands to 'pending' status.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
