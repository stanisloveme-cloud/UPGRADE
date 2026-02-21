import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Clean users
    await prisma.user.deleteMany();

    // Create admin user
    await prisma.user.create({
        data: {
            username: 'admin',
            password: 'admin123',
            role: 'admin',
        },
    });
    console.log('✅ Admin user created (admin / admin123)');

    // Clean existing data
    await prisma.briefing.deleteMany();
    await prisma.sessionQuestion.deleteMany();
    await prisma.sessionSpeaker.deleteMany();
    await prisma.session.deleteMany();
    await prisma.track.deleteMany();
    await prisma.hall.deleteMany();
    await prisma.speaker.deleteMany();
    await prisma.event.deleteMany();
    // Keep users to avoid deleting the admin if he exists, or handle via upsert
    // await prisma.user.deleteMany(); 

    // Create Admin User
    const adminEmail = 'admin';
    const adminPassword = 'Nhy67ujm'; // In real app, hash this!

    // Check if user exists to avoid unique constraint errors or use upsert
    const existingAdmin = await prisma.user.findUnique({ where: { username: adminEmail } });
    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                username: adminEmail,
                password: adminPassword,
                role: 'admin', // Assuming role field exists or defaulting
                isSuperAdmin: true,
            },
        });
        console.log(`  ✅ Admin User created: ${adminEmail}`);
    } else {
        await prisma.user.update({ where: { username: adminEmail }, data: { isSuperAdmin: true } });
        console.log(`  ℹ️ Admin User already exists: ${adminEmail}`);
    }

    // Create Vladislav User
    const vladEmail = 'vladislav.shirobokov@gmail.com';
    const vladPassword = '123456';

    const existingVlad = await prisma.user.findUnique({ where: { username: vladEmail } });
    if (!existingVlad) {
        await prisma.user.create({
            data: {
                username: vladEmail,
                password: vladPassword,
                role: 'user',
                isSuperAdmin: true,
            },
        });
        console.log(`  ✅ User created: ${vladEmail} (Password: ${vladPassword})`);
    } else {
        await prisma.user.update({ where: { username: vladEmail }, data: { password: vladPassword } });
        console.log(`  🔄 User updated: ${vladEmail} (Password reset to 123456)`);
    }

    // Create Event (Force ID 1)
    const event = await prisma.event.create({
        data: {
            id: 1, // Force ID 1 to match frontend hardcoding
            name: 'New Retail Forum 2025',
            description: 'Крупнейший форум по ритейлу и e-commerce в России',
            startDate: new Date('2025-10-21'),
            endDate: new Date('2025-10-22'),
            status: 'published',
        },
    });
    console.log(`  ✅ Event 1: ${event.name} (ID: ${event.id})`);

    // Create a second event to ensure ID 2 exists (if sequence wasn't reset)
    // or just to have more data.
    const event2 = await prisma.event.create({
        data: {
            id: 2,
            name: 'Retail Tech 2026',
            description: 'Технологии в ритейле',
            startDate: new Date('2026-04-10'),
            endDate: new Date('2026-04-11'),
            status: 'draft',
        },
    });
    console.log(`  ✅ Event 2: ${event2.name} (ID: ${event2.id})`);

    // Create Halls
    const hallsData = [
        { name: 'Трансформер', capacity: 400, sortOrder: 1 },
        { name: 'Олимпийский', capacity: 200, sortOrder: 2 },
        { name: 'Останкино', capacity: 250, sortOrder: 3 },
        { name: 'Крылатское', capacity: 10, sortOrder: 4 },
        { name: 'Битца', capacity: 200, sortOrder: 5 },
    ];

    const halls: Record<string, any> = {};
    for (const h of hallsData) {
        halls[h.name] = await prisma.hall.create({
            data: { eventId: event.id, ...h },
        });
        console.log(`  ✅ Hall: ${h.name} (${h.capacity} чел.)`);
    }

    const day1 = new Date('2025-10-21');

    // Create Tracks + Sessions for Day 1
    const tracksDay1 = [
        {
            hall: 'Трансформер',
            tracks: [
                {
                    name: 'Ритейл стратегии',
                    startTime: '11:00',
                    endTime: '13:00',
                    sessions: [
                        { name: 'Открытие форума', startTime: '11:00', endTime: '11:30' },
                        { name: 'Ритейл стратегии: тренды 2025', startTime: '11:30', endTime: '13:00' },
                    ],
                },
                {
                    name: 'Покупатели и ритейлеры',
                    startTime: '14:00',
                    endTime: '15:30',
                    sessions: [
                        { name: 'Новый покупатель: портрет и ожидания', startTime: '14:00', endTime: '15:30' },
                    ],
                },
                {
                    name: 'Бизнес-модели и форматы',
                    startTime: '15:40',
                    endTime: '17:00',
                    sessions: [
                        { name: 'Трансформация бизнес-моделей в ритейле', startTime: '15:40', endTime: '17:00' },
                    ],
                },
                {
                    name: 'Маркетинговые стратегии',
                    startTime: '17:10',
                    endTime: '18:30',
                    sessions: [
                        { name: 'Маркетинг в эпоху AI', startTime: '17:10', endTime: '18:30' },
                    ],
                },
            ],
        },
        {
            hall: 'Олимпийский',
            tracks: [
                {
                    name: 'D2C E-Com бизнес-модели',
                    startTime: '11:00',
                    endTime: '13:00',
                    sessions: [
                        { name: 'D2C: прямые продажи покупателю', startTime: '11:00', endTime: '13:00' },
                    ],
                },
                {
                    name: 'IT и автоматизация бизнес процессов',
                    startTime: '14:00',
                    endTime: '15:30',
                    sessions: [
                        { name: 'Автоматизация в ритейле: от склада до кассы', startTime: '14:00', endTime: '15:30' },
                    ],
                },
                {
                    name: 'Логистика для интернет-магазинов',
                    startTime: '15:40',
                    endTime: '17:00',
                    sessions: [
                        { name: 'Last-mile доставка: тренды и решения', startTime: '15:40', endTime: '17:00' },
                    ],
                },
            ],
        },
        {
            hall: 'Останкино',
            tracks: [
                {
                    name: 'Performance маркетинг 2025',
                    startTime: '11:00',
                    endTime: '13:00',
                    sessions: [
                        { name: 'Performance-каналы: что работает в 2025', startTime: '11:00', endTime: '13:00' },
                    ],
                },
                {
                    name: 'Нативная реклама: Influence и Social маркетинг',
                    startTime: '14:00',
                    endTime: '15:30',
                    sessions: [
                        { name: 'Influence-маркетинг: ROI и метрики', startTime: '14:00', endTime: '15:30' },
                    ],
                },
                {
                    name: 'CRM маркетинг и лояльность',
                    startTime: '15:40',
                    endTime: '17:00',
                    sessions: [
                        { name: 'CRM: сегментация и персонализация', startTime: '15:40', endTime: '17:00' },
                    ],
                },
            ],
        },
        {
            hall: 'Крылатское',
            tracks: [
                {
                    name: 'ІТ-инфраструктура',
                    startTime: '11:00',
                    endTime: '13:00',
                    sessions: [
                        { name: 'Облачная инфраструктура для ритейла', startTime: '11:00', endTime: '13:00' },
                    ],
                },
                {
                    name: 'Замена офисных сотрудников ИИ-агентами',
                    startTime: '14:40',
                    endTime: '15:20',
                    sessions: [
                        { name: 'Мастер-класс: AI-агенты в офисе', startTime: '14:40', endTime: '15:20' },
                    ],
                },
            ],
        },
        {
            hall: 'Битца',
            tracks: [
                {
                    name: 'Бизнес-планирование и финансирование роста',
                    startTime: '11:00',
                    endTime: '13:00',
                    sessions: [
                        { name: 'Финансирование роста: инвестиции и кредиты', startTime: '11:00', endTime: '13:00' },
                    ],
                },
                {
                    name: 'Мебель, товары для дома',
                    startTime: '14:00',
                    endTime: '15:30',
                    sessions: [
                        { name: 'Рынок мебели: тренды и вызовы', startTime: '14:00', endTime: '15:30' },
                    ],
                },
            ],
        },
    ];

    for (const hallData of tracksDay1) {
        const hall = halls[hallData.hall];
        let trackOrder = 1;
        for (const trackData of hallData.tracks) {
            const track = await prisma.track.create({
                data: {
                    hallId: hall.id,
                    name: trackData.name,
                    day: day1,
                    startTime: trackData.startTime,
                    endTime: trackData.endTime,
                    sortOrder: trackOrder++,
                },
            });

            for (const sessionData of trackData.sessions) {
                await prisma.session.create({
                    data: {
                        trackId: track.id,
                        name: sessionData.name,
                        startTime: sessionData.startTime,
                        endTime: sessionData.endTime,
                    },
                });
            }
        }
        console.log(`  ✅ Tracks & Sessions for ${hallData.hall} (Day 1)`);
    }

    // ---- Day 2: 22 October ----
    const day2 = new Date('2025-10-22');

    const tracksDay2 = [
        {
            hall: 'Трансформер',
            tracks: [
                {
                    name: 'Будущее ритейла 2030',
                    startTime: '10:00',
                    endTime: '12:00',
                    sessions: [
                        { name: 'Keynote: ритейл через 5 лет', startTime: '10:00', endTime: '10:45' },
                        { name: 'Дискуссия: тренды и прогнозы', startTime: '11:00', endTime: '12:00' },
                    ],
                },
                {
                    name: 'Закрытие форума',
                    startTime: '17:00',
                    endTime: '18:00',
                    sessions: [
                        { name: 'Церемония закрытия и награждения', startTime: '17:00', endTime: '18:00' },
                    ],
                },
            ],
        },
        {
            hall: 'Олимпийский',
            tracks: [
                {
                    name: 'AI в ритейле — практика',
                    startTime: '10:00',
                    endTime: '13:00',
                    sessions: [
                        { name: 'AI-рекомендации: кейсы внедрения', startTime: '10:00', endTime: '11:30' },
                        { name: 'Персонализация: от данных к прибыли', startTime: '11:30', endTime: '13:00' },
                    ],
                },
            ],
        },
        {
            hall: 'Останкино',
            tracks: [
                {
                    name: 'Устойчивое развитие и ESG',
                    startTime: '14:00',
                    endTime: '16:00',
                    sessions: [
                        { name: 'ESG-стратегия для ритейлера', startTime: '14:00', endTime: '15:00' },
                        { name: 'Зелёная логистика', startTime: '15:00', endTime: '16:00' },
                    ],
                },
            ],
        },
    ];

    for (const hallData of tracksDay2) {
        const hall = halls[hallData.hall];
        let trackOrder = 10; // Higher sort order to not conflict with day 1
        for (const trackData of hallData.tracks) {
            const track = await prisma.track.create({
                data: {
                    hallId: hall.id,
                    name: trackData.name,
                    day: day2,
                    startTime: trackData.startTime,
                    endTime: trackData.endTime,
                    sortOrder: trackOrder++,
                },
            });

            for (const sessionData of trackData.sessions) {
                await prisma.session.create({
                    data: {
                        trackId: track.id,
                        name: sessionData.name,
                        startTime: sessionData.startTime,
                        endTime: sessionData.endTime,
                    },
                });
            }
        }
        console.log(`  ✅ Tracks & Sessions for ${hallData.hall} (Day 2 — 22 Oct)`);
    }

    // Create sample speakers
    const speakersData = [
        { firstName: 'Алексей', lastName: 'Иванов', company: 'Retail Group', position: 'CEO', email: 'ivanov@example.com' },
        { firstName: 'Мария', lastName: 'Петрова', company: 'E-Com Solutions', position: 'CMO', email: 'petrova@example.com' },
        { firstName: 'Дмитрий', lastName: 'Сидоров', company: 'TechRetail', position: 'CTO', email: 'sidorov@example.com' },
        { firstName: 'Елена', lastName: 'Козлова', company: 'Marketing Pro', position: 'Head of Digital', email: 'kozlova@example.com' },
        { firstName: 'Сергей', lastName: 'Морозов', company: 'LogiTech', position: 'VP Logistics', email: 'morozov@example.com' },
    ];

    for (const s of speakersData) {
        await prisma.speaker.create({ data: s });
        console.log(`  ✅ Speaker: ${s.firstName} ${s.lastName}`);
    }

    console.log('');
    console.log('🎉 Seed complete!');

    // List all users for debugging
    const allUsers = await prisma.user.findMany();
    console.log('--- DEBUG: CURRENT USERS ---');
    allUsers.forEach(u => console.log(`User: ${u.username}, Role: ${u.role}, Password: ${u.password}`));
    console.log('----------------------------');
    // --- SPEAKER PROTOTYPE DATA ---
    console.log('  🌱 Seeding Speaker Prototype Data...');

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
    console.log(`  ✅ Prototype Speaker: ${ivan.firstName}`);

    // 2. Create Event 2024 (Past)
    const event2024 = await prisma.event.create({
        data: {
            id: 2024,
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
    await (prisma as any).speakerRating.create({
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
            id: 2025,
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

    // --- END PROTOTYPE DATA ---
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
