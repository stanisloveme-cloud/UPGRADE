import { chromium } from 'playwright';
import * as fs from 'fs';

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ 
        viewport: { width: 1920, height: 1080 } 
    });
    
    console.log('Navigating to program page...');
    // Drop networkidle requirement, just wait for DOM
    await page.goto('https://spring.upgrade.st/program', { waitUntil: 'domcontentloaded' });
    
    console.log('Scrolling down to Speakers section...');
    // Scroll a few times with explicit waits to trigger Tilda LazyLoad
    for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(500);
    }
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'tmp/tilda_speakers_view.png' });
    
    // Dump the outerHTML of the current viewport content for inspection
    const html = await page.content();
    fs.writeFileSync('tmp/tilda_viewport.html', html.slice(0, 2000000)); // cap size
    
    await browser.close();
    console.log('Saved inspection artifacts.');
}

run().catch(console.error);
