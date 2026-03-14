import { chromium } from 'playwright-core';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  console.log('🚀 Запускаем браузер для анализа DOM... Пожалуйста, не закрывайте его.');
  
  // Launch in headed mode so user can log in if needed
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔗 Переходим на https://sales.upgradecrm.ru/login');
  await page.goto('https://sales.upgradecrm.ru/login');

  console.log('Авторизуемся...');
  // Adjust selectors based on standard login forms if these fail
  await page.fill('input[type="email"], input[name="email"], #email', 'vladislav.shirobokov@gmail.com').catch(() => {});
  await page.fill('input[type="password"], input[name="password"], #password', 'vladislav456').catch(() => {});
  await page.click('button[type="submit"], input[type="submit"], .btn-primary').catch(() => {});
  
  await page.waitForTimeout(3000); // Wait for redirect to finish

  console.log('🔗 Переходим на https://sales.upgradecrm.ru/dashboard/program/event/16');
  await page.goto('https://sales.upgradecrm.ru/dashboard/program/event/16');

  console.log('Ожидаем авторизации (скрипт ждет 60 секунд, если вы не авторизованы)...');
  
  // Wait until we are definitely on the program page and the grid is visible
  try {
    // Wait for a generic container that indicates the program has loaded
    await page.waitForSelector('.program-container, #program-container, table, .table', { timeout: 60000 });
    console.log('✅ Страница программы успешно загружена!');
  } catch (err) {
    console.warn('⚠️ Ожидание селектора истекло. Возможно, страница выглядит иначе. Продолжаем анализ...');
  }

  // To be safe, wait a couple of seconds for any JS to finish rendering
  await page.waitForTimeout(3000);

  console.log('Скроллим страницу для подгрузки lazy-load элементов...');
  await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if (totalHeight >= scrollHeight) {
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
  await page.waitForTimeout(2000);

  // 1. Save the outer DOM of the grid
  const mainDom = await page.content();
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
  }
  fs.writeFileSync(path.join(dataDir, 'legacy_program_main.html'), mainDom);
  console.log('💾 Сохранен основной HTML страницы (legacy_program_main.html).');

  // 2. Try to find local "pencil" Edit buttons for sessions and click the first one
  console.log('Ищем "карандашики" для открытия модалки сессии...');
  
  // Normally pencil icons have classes like 'fa-pencil', 'edit-btn', etc. 
  // Let's look for common edit button selectors.
  const editButtons = await page.$$('a[href*="/edit"], button:has(i.fa-pencil), .fa-pencil, .edit-session, [title*="Редактировать"]');
  
  if (editButtons.length > 0) {
      console.log(`Найдено ${editButtons.length} кнопок редактирования. Кликаем по первой...`);
      try {
          // Click the first one
          await editButtons[0].click();
          
          // Wait for a modal to appear
          await page.waitForSelector('.modal.show, .modal.in, .el-dialog, .v-dialog', { timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(2000); // Wait for animation
          
          const modalDom = await page.content();
          fs.writeFileSync(path.join(dataDir, 'legacy_program_modal.html'), modalDom);
          console.log('💾 Сохранен HTML с открытой модалкой сессии (legacy_program_modal.html).');
      } catch (e) {
          console.error('Не удалось кликнуть по карандашику или дождаться модалки:', e.message);
      }
  } else {
      console.warn('Кнопки "карандашики" не найдены. Собираем все карточки сессий со страницы...');
      const sessions = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('[class*="session"], [class*="card"], [class*="event"], .rounded-lg.shadow, a[href*="/session/"]'));
          let results = [];
          for(const el of cards) {
              if(el.textContent && el.textContent.length > 20) {
                   results.push({
                       classes: el.className,
                       html: el.outerHTML.substring(0, 300),
                       href: el.getAttribute('href') || (el.querySelector('a') ? el.querySelector('a')!.getAttribute('href') : null),
                       text: el.textContent.trim().substring(0, 100)
                   });
              }
          }
          
          const unique = [];
          const seen = new Set();
          for(const item of results) {
              const key = item.href || item.text;
              if(!seen.has(key)) {
                  seen.add(key);
                  unique.push(item);
              }
          }
          return unique;
      });

      fs.writeFileSync(path.join(dataDir, 'session_blocks.json'), JSON.stringify(sessions, null, 2));
      console.log(`Найдено ${sessions.length} потенциальных карточек сессий. Данные сохранены в data/session_blocks.json`);
  }
  await page.waitForTimeout(5000);
  await browser.close();
}

run().catch(console.error);
