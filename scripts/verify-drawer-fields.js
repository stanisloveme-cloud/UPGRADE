const { chromium } = require('playwright');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to local login...');
        await page.goto('http://localhost:5173/login');
        
        console.log('Logging in...');
        await page.fill('input[type="email"]', 'admin@example.com'); // Will be cleared by default admin creds probably, but just click
        // Assuming default dev creds admin / admin, but let's just click 'admin@example.com' if it's there
        await page.fill('input[type="email"]', 'admin');
        await page.fill('input[type="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForNavigation();

        console.log('Navigating to events/42/program...');
        await page.goto('http://localhost:5173/events/42/program');
        await page.waitForNavigation();
        
        await page.waitForTimeout(2000); // Give grid time to load

        console.log('Trying to click a session card...');
        const sessionCard = await page.$('.session-card');
        if (sessionCard) {
            await sessionCard.click();
        } else {
            console.log('No sessions found!');
            await browser.close();
            return;
        }

        console.log('Waiting for drawer...');
        await page.waitForSelector('.ant-drawer-open', { timeout: 5000 });
        
        await page.waitForTimeout(1000); // let animations finish
        
        // Check fields
        const nameValue = await page.$eval('input#name', el => el.value);
        console.log('Field "name" value:', nameValue);
        
        if (nameValue && nameValue.trim().length > 0) {
            console.log('✅ Name field is correctly populated!');
        } else {
            console.log('❌ Name field is EMPTY! Fix did not work.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await browser.close();
    }
})();
