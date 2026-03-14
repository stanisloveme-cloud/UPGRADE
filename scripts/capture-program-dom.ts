import { chromium } from 'playwright-core';
import * as fs from 'fs';
import * as path from 'path';

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
  
  console.log('🔗 Navigating to Event 16...');
  await page.goto('https://sales.upgradecrm.ru/dashboard/program/event/16');
  
  console.log('⏳ Waiting for Vue to render details...');
  await page.waitForTimeout(10000); // 10 seconds to ensure ALL lazy components loaded
  
  const dataDir = path.resolve(__dirname, '../data');
  const artifactsDir = path.resolve(__dirname, '../../.gemini/antigravity/brain/fc74542b-f763-4795-a3bc-0e938ea6ccea');
  
  console.log('📸 Taking Screenshot...');
  await page.screenshot({ path: path.join(artifactsDir, 'legacy_program.jpeg'), fullPage: true });

  console.log('🗂️ Capturing full body innerHTML...');
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync(path.join(dataDir, 'rendered_program.html'), html);
  
  console.log('✅ Done!');
  await browser.close();
}

run().catch(console.error);
