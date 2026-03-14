import { chromium } from 'playwright-core';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
    console.log('🚀 Получаем cookies авторизации...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://sales.upgradecrm.ru/login');
    await page.fill('input[type="email"]', 'vladislav.shirobokov@gmail.com');
    await page.fill('input[type="password"]', 'vladislav456');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000); // Ожидание редиректа на дашборд
    
    console.log('Переходим на страницу программы для получения токенов...');
    await page.goto('https://sales.upgradecrm.ru/dashboard/program/event/16');
    await page.waitForTimeout(3000);
    
    const cookies = await context.cookies();
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    const tokens = await page.evaluate(() => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const appDiv = document.querySelector('#app');
        let version = '';
        if (appDiv) {
            try {
               const dataPage = JSON.parse(appDiv.getAttribute('data-page') || '{}');
               version = dataPage.version || '';
            } catch(e) {}
        }
        return { csrf, version };
    });
    
    const config = {
        cookies: cookieString,
        csrfToken: tokens.csrf,
        inertiaVersion: tokens.version
    };
    
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    
    fs.writeFileSync(path.join(dataDir, 'api-config.json'), JSON.stringify(config, null, 2));
    console.log(`✅ Конфигурация API сохранена в api-config.json`);
    
    await browser.close();
}

run().catch(console.error);
