import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    try {
        const ls = { email: "test@test.com" };
        console.log("Testing findFirst email...");
        await prisma.speaker.findFirst({ where: { email: ls.email } });
        console.log("Success findFirst email");

        const ls2 = { name: "V", surname: "S" };
        console.log("Testing findFirst name...");
        await prisma.speaker.findFirst({ where: { firstName: ls2.name, lastName: ls2.surname } });
        console.log("Success findFirst name");
    } catch (e: any) {
        console.error("PRISMA ERROR FULL:", e.message);
    }
}

run()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
