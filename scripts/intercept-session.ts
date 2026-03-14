import { chromium } from 'playwright-core';
import * as fs from 'fs';
import * as path from 'path';

const EMAIL = 'vladislav.shirobokov@gmail.com';
const PASSWORD = 'vladislav456';
const TARGET_URL = 'https://sales.upgradecrm.ru/dashboard/program/event/16';

async function run() {
  console.log('🚀 Запускаем браузер для перехвата API сессии...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const interceptedResponses: any[] = [];

  page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('api') || url.includes('session') || url.includes('speaker') || response.headers()['content-type']?.includes('json')) {
          try {
              const text = await response.text();
              const json = JSON.parse(text);
              interceptedResponses.push({ url, data: json });
              console.log(`📦 Перехвачен JSON с ${url.substring(0, 100)}...`);
          } catch (e) {
              // Игнорируем не-JSON ответы
          }
      }
  });

  console.log('🔗 Логинимся...');
  await page.goto('https://sales.upgradecrm.ru/login');
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('🔗 Переходим на страницу программы...');
  await page.goto(TARGET_URL);
  await page.waitForTimeout(5000);

  const editButtons = await page.$$('a[href*="/edit"], button:has(i.fa-pencil), .fa-pencil, .edit-session, [title*="Редактировать"]');
  console.log(`Найдено ${editButtons.length} кнопок редактирования сессий.`);

  if (editButtons.length > 0) {
      console.log('Кликаем по первой сессии...');
      await editButtons[0].scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await editButtons[0].click();
      
      // Ждем чтобы данные загрузились
      console.log('Ожидаем XHR...');
      await page.waitForTimeout(5000);
  } else {
      console.log('Не нашли по чему кликнуть.');
  }

  const outPath = path.join(dataDir, 'intercepted_session_api.json');
  fs.writeFileSync(outPath, JSON.stringify(interceptedResponses, null, 2));
  console.log(`✅ Сохранили перехваченные ответы в ${outPath}`);

  await browser.close();
}

run().catch(console.error);
