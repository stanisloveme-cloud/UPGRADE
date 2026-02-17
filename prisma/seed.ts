import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

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
            },
        });
        console.log(`  ✅ Admin User created: ${adminEmail}`);
    } else {
        console.log(`  ℹ️ Admin User already exists: ${adminEmail}`);
    }

    // Create Event
    const event = await prisma.event.create({
        data: {
            name: 'New Retail Forum 2025',
            description: 'Крупнейший форум по ритейлу и e-commerce в России',
            startDate: new Date('2025-10-21'),
            endDate: new Date('2025-10-22'),
            status: 'published',
        },
    });
    console.log(`  ✅ Event: ${event.name}`);

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
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
