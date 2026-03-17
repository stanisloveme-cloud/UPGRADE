import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data export from Devstand...');

  // 1. Fetch Speakers
  const speakers = await prisma.speaker.findMany();
  console.log(`Fetched ${speakers.length} speakers.`);

  // 2. Fetch Event 76
  const eventId = 76;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      halls: {
        include: {
          tracks: {
            include: {
              sessions: {
                include: {
                  speakers: true,
                  questions: true,
                  briefings: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!event) {
    console.error(`Event with ID ${eventId} not found!`);
    process.exit(1);
  }

  console.log(`Fetched Event: ${event.name}`);

  // Create an export object
  const exportData = {
    speakers,
    event
  };

  const outputPath = '/app/tmp_export_data.json';
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`Data successfully exported to ${outputPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
