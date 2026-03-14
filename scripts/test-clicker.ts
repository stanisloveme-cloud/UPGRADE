import { chromium } from 'playwright-core';

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
  await page.waitForTimeout(5000);
  
  const loc = page.locator('a.text-black.text-decoration-none').first();
  const title = await loc.textContent();
  console.log('Clicking session:', title?.trim());
  await loc.click();
  
  console.log('Waiting for modal...');
  await page.waitForTimeout(3000);
  
  // Dump everything that looks like a modal
  const modals = await page.$$('.modal, .v-dialog, .el-dialog, [role="dialog"], .dialog');
  console.log('Found modals:', modals.length);
  
  if (modals.length > 0) {
       for(let m of modals) {
           const visible = await m.isVisible();
           if(visible) {
               console.log('--- VISIBLE MODAL TEXT ---');
               const text = await m.innerText();
               console.log(text.substring(0, 1000));
               
               // Dump all image URLs inside modal
               const imgs = await m.$$eval('img', imgs => imgs.map(img => img.src));
               console.log('Images inside modal:', imgs);
           }
       }
  } else {
       console.log('No dialog elements found.');
  }

  await browser.close();
}

run().catch(console.error);
