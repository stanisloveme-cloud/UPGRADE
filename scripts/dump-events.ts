import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching events...');
    const events = await prisma.event.findMany({
        include: {
            halls: {
                include: {
                    tracks: true
                }
            }
        }
    });

    console.log(JSON.stringify(events, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
