import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; // Import adapter
import * as bcrypt from 'bcrypt';
require('dotenv').config(); // Ensure env vars are loaded

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding Speaker Prototype Data...');

    // 1. Create or Find "Ivan Ivanov" (Gold ID)
    const ivan = await prisma.speaker.upsert({
        where: { id: 999 }, // specific ID for testing
        update: {},
        create: {
            id: 999,
            firstName: 'Ivan',
            lastName: 'Ivanov',
            email: 'ivan@example.com',
            phone: '+79990000001',
            company: 'RetailSolutions', // Current company
            position: 'CTO',
            bio: 'Expert in Retail Tech and AI.',
        },
    });
    console.log('Use Speaker:', ivan.firstName);

    // 2. Create Event 2024 (Past)
    const event2024 = await prisma.event.create({
        data: {
            name: 'Retail Tech 2024',
            startDate: new Date('2024-05-20'),
            endDate: new Date('2024-05-21'),
            status: 'archived',
            halls: {
                create: {
                    name: 'Main Hall',
                    tracks: {
                        create: {
                            name: 'Track 1',
                            day: new Date('2024-05-20'),
                            startTime: '10:00',
                            endTime: '18:00',
                            sessions: {
                                create: {
                                    name: 'AI in Retail 2024',
                                    startTime: '10:00',
                                    endTime: '11:00',
                                    speakers: {
                                        create: {
                                            speakerId: ivan.id,
                                            role: 'speaker',
                                            // Snapshot: He worked at TechCorp back then
                                            companySnapshot: 'TechCorp',
                                            positionSnapshot: 'Lead Developer',
                                            presentationTitle: 'The Future of AI',
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // 3. Rate him for 2024
    await prisma.speakerRating.create({
        data: {
            speakerId: ivan.id,
            eventId: event2024.id,
            score: 4,
            comment: 'Good technical content, slightly nervous.',
        }
    });

    // 4. Create Event 2025 (Future/Current)
    const event2025 = await prisma.event.create({
        data: {
            name: 'Retail Tech 2025',
            startDate: new Date('2025-09-10'),
            endDate: new Date('2025-09-11'),
            status: 'published',
            halls: {
                create: {
                    name: 'Grand Hall',
                    tracks: {
                        create: {
                            name: 'Track A',
                            day: new Date('2025-09-10'),
                            startTime: '09:00',
                            endTime: '18:00',
                            sessions: {
                                create: {
                                    name: 'Loyalty Systems Evolution',
                                    startTime: '14:00',
                                    endTime: '15:00',
                                    speakers: {
                                        create: {
                                            speakerId: ivan.id,
                                            role: 'speaker',
                                            // Snapshot: Now at RetailSolutions
                                            companySnapshot: 'RetailSolutions',
                                            positionSnapshot: 'CTO',
                                            presentationTitle: 'Loyalty 3.0',
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // 5. Rate him for 2025 (Mocking post-event rating)
    await prisma.speakerRating.create({
        data: {
            speakerId: ivan.id,
            eventId: event2025.id,
            score: 5,
            comment: 'Excellent improvement! Verify engaging.',
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
