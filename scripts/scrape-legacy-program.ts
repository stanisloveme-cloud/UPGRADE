const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const EMAIL = 'vladislav.shirobokov@gmail.com';
const PASSWORD = 'vladislav456';
const TARGET_URL = 'https://sales.upgradecrm.ru/dashboard/program/event/16';

async function run() {
  console.log('🚀 Запускаем UI-парсер старой CRM (Upgrade Retail Весна 2025)...');
  
  const browser = await chromium.launch({ headless: true }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔗 Логинимся...');
  await page.goto('https://sales.upgradecrm.ru/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('🔗 Переходим на страницу программы...');
  await page.goto(TARGET_URL);

  // Wait for the main app to load
  await page.waitForSelector('#app', { timeout: 60000 });
  
  console.log('💾 Извлекаем базовые данные из состояния Inertia.js (Залы, Дни, Сессии)...');
  
  const inertiaData = await page.evaluate(() => {
    const appDiv = document.querySelector('#app');
    if (!appDiv) return null;
    try {
        const dataPage = JSON.parse(appDiv.getAttribute('data-page') || '{}');
        return dataPage.props;
    } catch (e) {
        return null;
    }
  });

  if (!inertiaData) {
      console.error('Не удалось извлечь данные из data-page!');
      await browser.close();
      return;
  }

  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
  }
  
  // Save intermediate state just in case
  fs.writeFileSync(path.join(dataDir, 'urspring25_inertia.json'), JSON.stringify(inertiaData, null, 2));
  console.log('✅ Базовый стейт сохранен в data/urspring25_inertia.json. Проверяем наличие полных данных о сессиях...');

  console.log('🌐 Пробуем вытащить данные через API с правильными заголовками Inertia...');

  const token = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  });

  const apiHeaders = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Inertia': 'true',
    'X-Inertia-Version': inertiaData?.version || '',
    'X-CSRF-TOKEN': token
  };

  console.log('🌐 Перехватываем XHR-ответ API легаси CRM с данными программы...');

  let eventApiData = null;
  // Настраиваем перехватчик ДО перехода на страницу
  page.on('response', async (response: any) => {
      if (response.url().includes('/dashboard/program/event/16') && response.request().method() === 'GET') {
          try {
              eventApiData = await response.json();
              console.log('✅ Перехвачен JSON с данными сессий!');
          } catch(e) { /* ignore preflights or non-json */ }
      }
  });

  // Возвращаемся на страницу программы для триггера загрузки
  await page.goto(TARGET_URL);
  
  // Ждем, пока перехватчик поймает данные (до 30 сек)
  for (let i = 0; i < 30; i++) {
      if (eventApiData) break;
      await page.waitForTimeout(1000);
  }

  if (!eventApiData) {
      console.log('⚠️ Не удалось перехватить XHR запрос с сессиями. Попробуем извлечь из DOM...');
      // Фолбэк на DOM-парсинг если XHR не прошел (например, если загружен из кэша)
  }

  const sessionsData: any[] = [];
  const sessionIds: number[] = [];

  if (eventApiData) {
      // Ищем ID сессий внутри eventApiData
      // Ищем ID сессий внутри eventApiData
      function findSess(obj: any) {
          if (!obj || typeof obj !== 'object') return;
          
          Object.keys(obj).forEach(key => {
              if (key === 'sessions' && Array.isArray(obj[key])) {
                  obj[key].forEach((s: any) => {
                      if (s && s.id) sessionIds.push(s.id);
                  });
              } else if (key === 'session' && obj[key] && obj[key].id) {
                  sessionIds.push(obj[key].id);
              }
              
              if (typeof obj[key] === 'object') {
                  findSess(obj[key]);
              }
          });
      }
      
      findSess(inertiaData); // Ищем сразу в inertiaData потому что eventApiData пустой
      if (sessionIds.length === 0 && eventApiData) {
          findSess(eventApiData);
      }
  }

  const uniqueIds = Array.from(new Set(sessionIds));
  console.log(`Найдено ${uniqueIds.length} уникальных ID сессий. Начинаем обход модалок...`);

  // Обходим каждую сессию
  for (let i = 0; i < uniqueIds.length; i++) {
      const id = uniqueIds[i];
      try {
          const href = `/dashboard/program/session/${id}/edit`;
          console.log(`Открываем сессию [${i+1}/${uniqueIds.length}]: ${href}`);
          
          const sessionPage = await context.newPage();
          await sessionPage.goto(`https://sales.upgradecrm.ru${href}`);
          await sessionPage.waitForTimeout(2500); // Wait for modal/speakers to render
          
          const speakers = await sessionPage.evaluate(() => {
              const speakerNames = Array.from(document.querySelectorAll('.multiselect__tag, label, .text-sm'))
                  .map(el => el.textContent?.trim())
                  .filter(text => text && text.length > 2);
              return speakerNames;
          });
          
          const rawHTML = await sessionPage.content();
          
          sessionsData.push({
              id,
              href,
              speakersRaw: speakers,
              htmlSample: rawHTML.substring(0, 1000)
          });
          
          await sessionPage.close();
      } catch(err) {
          console.error(`Ошибка при разборе сессии ${id}:`, err);
      }
  }

  const output = {
      inertiaProps: inertiaData,
      eventApiData: eventApiData,
      scrapedSessions: sessionsData
  };

  fs.writeFileSync(path.join(dataDir, 'urspring25_raw.json'), JSON.stringify(output, null, 2));
  console.log('✅ Данные успешно спарсены!');

  console.log('Закрываем браузер.');
  await browser.close();
}

run().catch(console.error);
