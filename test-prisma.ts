// test-prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching Event 1...');
    const ev = await prisma.event.findUnique({
        where: { id: 1 },
        include: {
            halls: true
        }
    });

    console.log('Event 1:', ev);

    console.log('Fetching ALL halls...');
    const halls = await prisma.hall.findMany();
    console.log('All halls:', halls);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
