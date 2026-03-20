const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://nrf.upgrade.st/program');
  
  // Wait for dynamic content
  await page.waitForTimeout(5000);
  
  // Scrape styles
  const html = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  
  fs.writeFileSync('tilda_live.html', html);
  console.log("Saved live DOM to tilda_live.html");
  
  await browser.close();
})();
