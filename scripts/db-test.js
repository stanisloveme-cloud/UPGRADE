// db-test.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const events = await prisma.event.findMany({
        include: {
            halls: {
                include: {
                    tracks: true
                }
            }
        }
    });

    console.dir(events, { depth: null });
}

run().catch(console.error).finally(() => prisma.$disconnect());
