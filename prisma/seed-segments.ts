import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

const segments = [
    {
        name: 'Привлечение покупателей',
        children: [
            {
                name: 'Социальные сети и мессенджеры',
                children: [
                    'Социальные сети',
                    'Инструменты автоматизации работы с каналом',
                    'Подбор инфлюэнсеров',
                    'Мессенджеры',
                    'Инструменты для работы с мессенджерами',
                    'Размещение рекламы в соцсетях'
                ]
            },
            { name: 'Агентства social commerce' },
            {
                name: 'SMM',
                children: [
                    'Агентства',
                    'Производство контента'
                ]
            },
            {
                name: 'CPA-сети и платформы',
                children: [
                    'Партнерские сети (CPA-сети)',
                    'Работа с CPA-сетями: антифрод',
                    'CPA-платформы'
                ]
            },
            {
                name: 'Управление рекламой',
                children: [
                    'Платформы контекстной и таргетированной рекламы',
                    'Подбор целевой аудитории (таргетинг)',
                    'Автоматизация контекстной и таргетированной рекламы',
                    'Инструментарий ремаркетинга'
                ]
            },
            { name: 'Медиаагентства' },
            { name: 'Мобильная реклама' },
            { name: 'Performance-агентства' },
            { name: 'Специализированные SEO-агентства' },
            { name: 'SEO-сервис' },
            { name: 'PR и коммуникационные агентства' },
            {
                name: 'Стриминговые сервисы',
                children: [
                    'Стриминг-провайдеры',
                    'Создание контента'
                ]
            },
            { name: 'Акции' },
            { name: 'Купоны' },
            {
                name: 'Retail Media',
                children: [
                    'Агентства Retail Media',
                    'Технологические инструменты и платформы'
                ]
            }
        ]
    },
    {
        name: 'Логистика',
        children: [
            {
                name: 'Автоматизация логистических процессов',
                children: [
                    'Поиск и взаимодействие с поставщиками',
                    'Отслеживание статуса заказа',
                    'Учетная система',
                    'WMS',
                    'Валидация географических адресов',
                    'Расчет стоимости доставки',
                    'TMS',
                    'Интеграторы',
                    'Маршрутизация',
                    'Работа с курьерами'
                ]
            },
            {
                name: 'Доставка',
                children: [
                    'Доставка из магазинов',
                    'ПВЗ и постаматы',
                    'Курьерская доставка',
                    'Сборные грузы',
                    'Доставка готовой еды из ресторанов',
                    'Доставка на склад маркетплейсов',
                    'Срочная курьерская доставка',
                    'Крупногабарит'
                ]
            },
            { name: 'Фулфилмент' },
            { name: 'Дропшиппинг' },
            { name: 'Кроссбордер' },
            { name: 'Предоставление автомобилей' },
            { name: 'Аутстаф линейного персонала' },
            {
                name: 'После доставки',
                children: [
                    'Монтаж и наладка',
                    'Претензионная работа'
                ]
            }
        ]
    },
    {
        name: 'Маркетплейсы',
        children: [
            { name: 'Универсальные' },
            { name: 'Специализированные' },
            { name: 'Международные' },
            { name: 'C2C' },
            {
                name: 'Работа с маркетплейсами',
                children: [
                    'Онбординг',
                    'Аналитика для маркетплейсов',
                    'Управление продажами и контент'
                ]
            }
        ]
    },
    {
        name: 'Платежи и финансы',
        children: [
            {
                name: 'Эквайринг',
                children: [
                    'Инвойсинг',
                    'Прием платежей',
                    'Сотовые операторы',
                    'Токенизированная оплата',
                    'Электронные кошельки'
                ]
            },
            { name: 'Банки' },
            {
                name: 'Финансирование магазинов',
                children: [
                    'Факторинг',
                    'Кредитование'
                ]
            },
            {
                name: 'Кредитование покупателей',
                children: [
                    'Онлайн МФО',
                    'Банки-кредиторы',
                    'Рассрочка'
                ]
            },
            { name: 'Операторы ЭДО' },
            { name: 'МПС' },
            { name: 'Кешбек' },
            { name: 'BNPL-сервисы' },
            {
                name: 'Фискализация',
                children: [
                    'Стационарные устройства',
                    'Онлайн-кассы',
                    'Операторы фискальных данных (ОФД)',
                    'POS-системы'
                ]
            },
            { name: 'Система проверки контрагентов' }
        ]
    },
    {
        name: 'IT',
        children: [
            { name: 'Интеграторы и разработчики' },
            { name: 'Операторы D2C' },
            { name: 'Аутстаффинг IT-персонала' },
            {
                name: 'Web',
                children: [
                    'Конструкторы сайтов',
                    'eCommerce платформы'
                ]
            },
            {
                name: 'mCommerce',
                children: [
                    'Разработка мобильных приложений',
                    'Конструктор мобильных приложений'
                ]
            },
            { name: 'Защита от атак' },
            { name: 'Интеграционные платформы' },
            { name: 'CDN (Content Delivery Network)' }
        ]
    },
    {
        name: 'Управление магазином и работа с клиентом',
        children: [
            {
                name: 'Персонализация и рассылки',
                children: [
                    'CMC, Push', // CMC or SMS? Likely SMS, but transcribed as CMC based on screenshot (could be SMS)
                    'Платформы персонализации и оптимизации',
                    'Data Management',
                    'CDP (Customer Data Platform)',
                    'Персонализация и управление поиском',
                    'ESP (email service provider)',
                    'CRM-агентства'
                ]
            },
            {
                name: 'Данные по клиентам и заказам',
                children: [
                    'CRM',
                    'OMS (Order Management System)',
                    'ERP',
                    'Программы лояльности'
                ]
            },
            {
                name: 'Диалог с клиентом',
                children: [
                    'Чат-боты',
                    'Телефония',
                    'Онлайн-чаты',
                    'Call Tracking',
                    'Call-центр',
                    'Обратные звонки',
                    'Голосовые роботы',
                    'Поддержка клиентов онлайн',
                    'Видеочаты'
                ]
            },
            {
                name: 'Мониторинг и аналитика',
                children: [
                    'Анализ рекламной эффективности',
                    'Аналитика отзывов',
                    'WEB-аналитика: сбор информации',
                    'Проверка покупателей',
                    'Мобильная аналитика',
                    'Анализ конкурентов',
                    'Аналитика соцмедиа и СМИ',
                    'Валидация email-адресов'
                ]
            },
            {
                name: 'Каталог, ассортимент и контент',
                children: [
                    'Мониторинг и управление ценами',
                    'Банки описаний товаров',
                    'Предметная визуализация',
                    'Работа с отзывами',
                    'Фото- и видеопродакшн',
                    'PIM (Управление данными о товарах)',
                    'Создание и управление контентом',
                    'Аудит товарных карточек',
                    'Определение размеров'
                ]
            }
        ]
    },
    {
        name: 'Отраслевые организации',
        children: [
            { name: 'Форумы и конференции' },
            { name: 'Информация и новости' },
            { name: 'Исследования и консалтинг' },
            { name: 'Инвестиции' },
            { name: 'Обучение' },
            { name: 'Ассоциации' },
            { name: 'Сертификация товаров' }
        ]
    }
];

async function seedSegments() {
    console.log('Seeding market segments...');
    for (const l1 of segments) {
        let parentL1 = await prisma.marketSegment.findUnique({ where: { name: l1.name } });
        if (!parentL1) {
            parentL1 = await prisma.marketSegment.create({
                data: { name: l1.name }
            });
        }

        if (l1.children) {
            for (const l2 of l1.children) {
                const l2Name = typeof l2 === 'string' ? l2 : l2.name;
                let parentL2 = await prisma.marketSegment.findFirst({
                    where: { name: l2Name, parentId: parentL1.id }
                });
                if (!parentL2) {
                    // Workaround to ensure unique names globally if needed. Prisma has unique constraint on name.
                    // If names clash (e.g., 'CRM' exists twice), Prisma throws. 
                    // From screenshots, names seem unique enough, but let's handle uniqueness gracefully.
                    try {
                        parentL2 = await prisma.marketSegment.create({
                            data: { name: l2Name, parentId: parentL1.id }
                        });
                    } catch (e) {
                        // Fallback for duplicates by appending parent context
                        parentL2 = await prisma.marketSegment.create({
                            data: { name: `${l2Name} (${l1.name})`, parentId: parentL1.id }
                        });
                    }
                }

                if (typeof l2 === 'object' && l2.children) {
                    for (const l3 of l2.children) {
                        try {
                            await prisma.marketSegment.create({
                                data: { name: l3, parentId: parentL2.id }
                            });
                        } catch (e) {
                            await prisma.marketSegment.create({
                                data: { name: `${l3} (${l2Name})`, parentId: parentL2.id }
                            });
                        }
                    }
                }
            }
        }
    }
    console.log('Done seeding market segments!');
}

seedSegments()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
