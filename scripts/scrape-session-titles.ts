import { chromium } from 'playwright';
import * as fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Load cookies
  try {
    const cookieStr = fs.readFileSync('data/cookies.txt', 'utf8').trim();
    const cookies = cookieStr.split('; ').map(c => {
      const [name, ...rest] = c.split('=');
      const value = rest.join('=');
      return {
        name,
        value,
        domain: 'sales.upgradecrm.ru',
        path: '/'
      };
    });
    await context.addCookies(cookies);
    console.log('Injected cookies from data/cookies.txt');
  } catch(e) {
    console.log('No data/cookies.txt found or invalid format. Running without auth.');
  }

  const page = await context.newPage();
  
  console.log('Navigating to schedule program...');
  await page.goto('https://sales.upgradecrm.ru/admin/module/schedule/program', { waitUntil: 'load', timeout: 30000 });
  
  console.log('Extracting Inertia data...');
  const appElement = await page.$('#app');
  if (!appElement) {
      console.log('Could not find #app element. Did authentication fail?');
      await page.screenshot({ path: 'data/scrape_error.png' });
      await browser.close();
      return;
  }
  
  const dataPageStr = await appElement.getAttribute('data-page');
  const dataPage = JSON.parse(dataPageStr || '{}');
  
  const sessions = dataPage.props?.program?.sessions || dataPage.props?.sessions;
  
  if (!sessions) {
      console.log('Could not find sessions in dataPage.props', Object.keys(dataPage.props || {}));
      await browser.close();
      return;
  }
  
  console.log(`Found ${sessions.length} sessions. Mapping to target schema...`);
  
  const output = sessions.map((s: any) => ({
      id: s.id,
      title: s.title || s.name,
      time_start: s.time_start,
      time_end: s.time_end,
      day_id: s.event_day_id,
      track_id: s.event_track_id, 
      hall_id: s.event_hall_id
  }));
  
  fs.writeFileSync('data/session_titles.json', JSON.stringify(output, null, 2));
  console.log('Successfully saved to data/session_titles.json');
  
  await browser.close();
}

main().catch(console.error);

