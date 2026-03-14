import { chromium } from 'playwright-core';
import * as fs from 'fs';
import * as path from 'path';

const EMAIL = 'vladislav.shirobokov@gmail.com';
const PASSWORD = 'vladislav456';
const TARGET_URL = 'https://sales.upgradecrm.ru/dashboard/program/event/16';

async function run() {
  console.log('🚀 Запускаем браузер для сбора данных программы Весна 2025...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔗 Логинимся...');
  await page.goto('https://sales.upgradecrm.ru/login');
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('🔗 Переходим на страницу программы...');
  await page.goto(TARGET_URL);
  await page.waitForSelector('.program-container, #program-container, table, .table', { timeout: 60000 }).catch(()=>console.log('Хм, не вижу таблицу.'));
  await page.waitForTimeout(5000);

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
  await page.waitForTimeout(3000);

  // СНАЧАЛА СОБИРАЕМ ВСЕ КАРТОЧКИ СЕССИЙ
  console.log('Скидываем тексты со всех карточек сессий на странице...');
  const surfaceSessions = await page.evaluate(() => {
      // Ищем типичные классы для карточек расписания
      const sessionCards = Array.from(document.querySelectorAll('.session, .card, [class*="EventSession"]'));
      return sessionCards.map((card, i) => {
          return {
             index: i,
             text: card.textContent?.trim().replace(/\s+/g, ' ') || '',
             html: card.outerHTML.substring(0, 300)
          };
      }).filter(s => s.text.length > 20); // Игнорим пустые дивы
  });
  console.log(`Найдено ${surfaceSessions.length} поверхностных карточек сессий.`);
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
  }
  fs.writeFileSync(path.join(dataDir, 'urspring25_surface.json'), JSON.stringify(surfaceSessions, null, 2));


  const editButtons = await page.$$('a[href*="/edit"], button:has(i.fa-pencil), .fa-pencil, .edit-session, [title*="Редактировать"]');
  console.log(`Найдено ${editButtons.length} кнопок редактирования сессий.`);

  const scrapedSessions: any[] = [];
  
  for (let i = 0; i < editButtons.length; i++) {
      console.log(`⏳ Обрабатываем сессию ${i + 1} из ${editButtons.length}...`);
      try {
          // Кликаем по карандашику используя стабильный селектор или evaluate
          await editButtons[i].scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await editButtons[i].click();
          
          // Ждем открытия модалки
          await page.waitForSelector('.modal.show, .modal.in, .el-dialog, .v-dialog, .v-window', { timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(2000); // Wait for modal animation and API load inside modal
          
          // Извлекаем HTML модалки (достоверно)
          const modalHtml = await page.evaluate(() => {
              const modal = document.querySelector('.modal.show, .modal.in, .el-dialog, .v-dialog');
              return modal ? (modal as HTMLElement).innerText.substring(0, 1000) : 'Модалка не найдена';
          });
          
          // Извлекаем все тексты (потенциальные имена)
          const textContents = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.modal.show *, .el-dialog *'))
                   .map(el => el.textContent?.trim())
                   .filter(text => text && text.length > 3 && text.length < 100);
          });
          
          scrapedSessions.push({
             index: i,
             modalText: modalHtml,
             snippets: Array.from(new Set(textContents))
          });
          
          // Закрываем модалку, нажав Esc или кнопку закрытия
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000); // Wait for close animation
          // На случай если Esc не сработал
          const closeBtn = await page.$('.modal.show button.btn-close, .modal.show .close, .el-dialog__headerbtn');
          if (closeBtn) {
             await closeBtn.click().catch(()=>{});
             await page.waitForTimeout(500);
          }
          
      } catch (e) {
          console.error(`Ошибка при сборе сессии ${i+1}:`, (e as Error).message);
      }
  }

  fs.writeFileSync(path.join(dataDir, 'urspring25_speakers.json'), JSON.stringify(scrapedSessions, null, 2));
  console.log('✅ Данные успешно собраны и сохранены в data/urspring25_speakers.json');

  await browser.close();
}

run().catch(console.error);
