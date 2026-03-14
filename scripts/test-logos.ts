import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const sponsors = await prisma.sponsor.findMany({ take: 5, orderBy: { id: 'desc' } });
    console.log("Latest Sponsors:");
    sponsors.forEach(s => {
        console.log(`- ${s.name} | logoUrl: ${s.logoUrl} | logoFileUrl: ${s.logoFileUrl}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
