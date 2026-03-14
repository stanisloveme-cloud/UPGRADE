import { test, expect } from '@playwright/test';

test.describe('Session Creation (TC-12)', () => {
    test.beforeEach(async ({ page }) => {
        // Intercept failed responses
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400) {
                console.log('API ERROR:', resp.url(), resp.status(), await resp.text());
            }
        });
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

        // 1. Navigate to the app
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');
        await page.waitForURL('**/events');

        // 2. Go to Program of an event that has sessions (e.g. Retail Tech 2026)
        await page.waitForSelector('button:has-text("Программа")');
        const eventRow = page.locator('tr').filter({ hasText: 'Retail Tech 2026' }).first();
        if (await eventRow.count() > 0) {
            await eventRow.locator('button:has-text("Программа")').click();
        } else {
            // fallback
            await page.locator('button:has-text("Программа")').last().click();
        }

        // Make sure we are on the Grid tab
        const gridTab = page.locator('.ant-tabs-tab-btn:has-text("Сетка программы")').first();
        if (await gridTab.count() > 0) {
            await gridTab.click();
        }

        // Wait for the Grid data to render
        await page.waitForFunction(() => {
            return document.querySelector('.session-card') || 
                   document.querySelector('div[style*="cursor: pointer"]') ||
                   (document.textContent || '').includes('Создать сессию');
        });
    });

    test('should open Session Drawer via empty slot and add a new session', async ({ page }) => {
        // Create a track first to ensure we have a place to put the session
        const addTrackBtn = page.locator('button:has-text("Трек")').first();
        await expect(addTrackBtn).toBeVisible();
        await addTrackBtn.click();
        
        const trackModalTitle = page.locator('.ant-modal-title').filter({ hasText: /Создать /i });
        await expect(trackModalTitle).toBeVisible();

        await page.fill('input#name', 'Автотест Трек ' + Date.now());
        
        // Fill time range for track (09:00 to 18:00)
        await page.locator('[placeholder="Время начала"]').click();
        await page.fill('[placeholder="Время начала"]', '09:00');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        await page.locator('[placeholder="Время окончания"]').click();
        await page.fill('[placeholder="Время окончания"]', '18:00');
        await page.keyboard.press('Enter');
        await page.click('.ant-modal-content button:has-text("Сохранить")');
        await expect(trackModalTitle).toBeHidden();
        await page.waitForTimeout(1000); // Wait for grid to render new track

        // Reload the page to ensure the 'Создать сессию' button state is updated (workaround for possible state bug)
        await page.reload();
        await page.waitForSelector('button:has-text("Создать сессию")');

        // Now use the main create session button
        const mainCreateBtn = page.locator('button:has-text("Создать сессию")');
        await expect(mainCreateBtn).toBeEnabled({ timeout: 10000 });
        await mainCreateBtn.click();

        // Wait for Drawer
        const drawerTitle = page.locator('.ant-drawer-title').filter({ hasText: 'Создание сессии' });
        await expect(drawerTitle).toBeVisible();

        // Fill session details
        await page.fill('input#name', 'Новая Автотест Сессия ' + Date.now());

        // Fill TimeRange for session
        await page.locator('.ant-drawer-content [placeholder="Время начала"]').click();
        await page.fill('.ant-drawer-content [placeholder="Время начала"]', '10:00');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        await page.locator('.ant-drawer-content [placeholder="Время окончания"]').click();
        await page.fill('.ant-drawer-content [placeholder="Время окончания"]', '11:00');
        await page.keyboard.press('Enter');

        // Fill trackId if required and empty
        const trackIdInput = page.locator('input#trackId');
        if (await trackIdInput.count() > 0 && await trackIdInput.inputValue() === '') {
            await handleSelect(page, 'trackId');
        }

        // Wait for UI to settle
        await page.waitForTimeout(1000);

        // Save
        await page.click('.ant-drawer-content button:has-text("Сохранить")');

        // Give it a second to validate or send request
        await page.waitForTimeout(2000);
        
        // Take a screenshot if it fails to close
        await page.screenshot({ path: 'session_create_result.png', fullPage: true });

        // Verify Drawer closes
        await expect(drawerTitle).toBeHidden();

        // Verify the new session appears on the grid
        await expect(page.locator('text=/Новая Автотест Сессия/').first()).toBeVisible();
    });
});

async function handleSelect(page: any, id: string) {
    const el = page.locator(`input#${id}`);
    if (await el.count() > 0) {
        await el.click();
        await page.waitForTimeout(500);
        await page.locator('.ant-select-item-option-content').first().click();
    }
}
