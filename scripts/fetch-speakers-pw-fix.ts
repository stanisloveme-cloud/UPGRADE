import { chromium } from 'playwright-core';
import * as fs from 'fs';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  console.log('🔗 Logging in...');
  await page.goto('https://sales.upgradecrm.ru/login');
  await page.fill('input[type="email"], input[name="email"]', 'vladislav.shirobokov@gmail.com');
  await page.fill('input[type="password"], input[name="password"]', 'vladislav456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  console.log('🔗 Extracting CSRF Token...');
  await page.goto('https://sales.upgradecrm.ru/dashboard/program/event/16');
  const csrfToken = await page.evaluate(() => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
  console.log('CSRF:', csrfToken);

  console.log('🔗 Fetching speakers JSON via POST...');
  const apiRes = await page.request.post('https://sales.upgradecrm.ru/dashboard/session_content/speakers', {
      headers: { 
          'X-Inertia': 'true', 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json'
      },
      data: JSON.stringify({ event_id: 16 })
  });
  
  console.log('Status HTTP:', apiRes.status());
  try {
     const json = await apiRes.json();
     fs.writeFileSync('data/session_content_speakers.json', JSON.stringify(json, null, 2));
     console.log('✅ Got JSON! Keys:', Object.keys(json));
     if(json.props) console.log('Props keys:', Object.keys(json.props));
     if(json.props && json.props.speakers) console.log('🔥 speakers count:', json.props.speakers.length);
  } catch(e: any) {
     console.log('Could not parse JSON payload:', e.message);
  }
  
  await browser.close();
}
run();
