const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Capture page logs
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error));
    page.on('response', async (response) => {
        if (!response.url().includes('/api/')) return;
        if (!response.ok()) {
            console.error(`API ERROR [${response.status()}] ${response.url()}:`, await response.text().catch(()=>''));
        }
    });

    try {
        console.log('Navigating to devstand...');
        await page.goto('https://devupgrade.space4you.ru/');
        
        console.log('Logging in...');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]');
        await page.waitForNavigation();

        console.log('Navigating to events/42/program...');
        await page.goto('https://devupgrade.space4you.ru/events/42/program');
        await page.waitForNavigation();
        
        console.log('Current URL:', page.url());
        await page.waitForTimeout(2000); // Give grid time to load

        console.log('Trying to click a session card...');
        const sessionCard = await page.$('.session-card');
        if (sessionCard) {
            await sessionCard.click();
        } else {
            console.log('No sessions found!');
            return;
        }

        await page.waitForSelector('.ant-drawer-open', { timeout: 5000 }).catch(() => console.log('Drawer not opened.'));
        
        const isDrawerOpen = await page.isVisible('.ant-drawer-open');
        if (!isDrawerOpen) {
            console.log('Cannot open drawer. Maybe no tracks exist?');
            return;
        }
        
        console.log('Drawer opened. Checking buttons...');
        const buttons = await page.$$eval('.ant-drawer-footer button', btns => btns.map(b => ({ text: b.innerText, disabled: b.disabled })));
        console.log('Found buttons in footer:', buttons);

        console.log('Clicking "Отмена"...');
        await page.click('button:has-text("Отмена")');
        
        await page.waitForTimeout(2000); // Give it time to close
        const isDrawerOpen2 = await page.isVisible('.ant-drawer-open');
        console.log(`Is Drawer still open after Cancel? ${isDrawerOpen2}`);

        if (isDrawerOpen2) {
            console.log('Cancel failed. Trying "Удалить" and cancelling internal confirm...');
            page.once('dialog', dialog => dialog.dismiss());
            await page.click('button:has-text("Удалить")');
            await page.waitForTimeout(1000);
            
            console.log('Trying "Сохранить"...');
            await page.click('button:has-text("Сохранить")');
            await page.waitForTimeout(3000);
        }

    } catch (err) {
        console.error('Script Error:', err);
    } finally {
        await browser.close();
    }
})();
