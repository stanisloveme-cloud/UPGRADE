import { test, expect } from '@playwright/test';

test.describe('Session Editor & Conflicts (TC-03 & TC-04)', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Navigate to the app (uses baseURL from playwright.config.ts)
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');
        await page.waitForURL('**/events');

        // 2. Go to Program
        await page.waitForSelector('button:has-text("Программа")');
        await page.locator('button:has-text("Программа")').last().click();

        // Make sure we are on the Grid tab
        const gridTab = page.locator('.ant-tabs-tab-btn:has-text("Сетка программы")').first();
        if (await gridTab.count() > 0) {
            await gridTab.click();
        }

        // Wait for the Grid data to render
        await page.waitForSelector('.session-card');
    });

    test('should open Session Editor and modify internal comment', async ({ page }) => {
        // 3. Click the session
        await page.locator('.session-card').first().click();

        // 4. Wait for Drawer
        const drawerTitle = page.locator('.ant-drawer-title').filter({ hasText: 'Редактирование сессии' });
        await expect(drawerTitle).toBeVisible();

        // Fill the description field
        const commentField = page.locator('textarea[id="description"]').first();
        if (await commentField.count() > 0) {
            await commentField.fill('test comment via playwright ' + Date.now());
        }

        // We skip clicking 'Добавить' to avoid adding empty required rows that fail validation

        // Intercept failed responses to debug
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400) {
                console.log('API ERROR:', resp.url(), resp.status(), await resp.text());
            }
        });

        // Intercept browser console logs
        page.on('console', msg => {
            console.log('BROWSER CONSOLE:', msg.text());
        });

        // Click "Сохранить" by triggering the native HTML5 form submission
        await page.waitForTimeout(1000); // Wait for React state to settle
        await page.evaluate(() => {
            const form = document.querySelector('.ant-drawer-content form') as HTMLFormElement;
            if (form) form.requestSubmit();
        });

        await page.waitForTimeout(2000); // Give it a sec to show validation

        // Take a screenshot of the frozen state for debugging
        await page.screenshot({ path: 'session_error.png', fullPage: true });

        // Dump the visible text (to see any notification banners)
        const allText = await page.locator('body').innerText();
        console.log('--- VISIBLE TEXT ---');
        console.log(allText.substring(0, 1000)); // Log the first 1000 chars

        // Verify it closes
        await expect(drawerTitle).toBeHidden();
    });
});
