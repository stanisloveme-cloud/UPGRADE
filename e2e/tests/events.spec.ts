import { test, expect } from '@playwright/test';

test.describe('Events Management (TC-09)', () => {
    test.beforeEach(async ({ page }) => {
        // Intercept logs to debug silent fails and HARDEN
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400) {
                const text = await resp.text().catch(() => '');
                console.log('API ERROR:', resp.url(), resp.status(), text);
                expect(resp.status(), `API Error on ${resp.url()}: ${text}`).toBeLessThan(400);
            }
        });
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

        // 1. Navigate to the app
        await page.goto('/');

        // 2. Login
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');

        // Wait for successful login and redirect
        await page.waitForURL('**/events');
    });

    test('should open events page, create, and verify a new event', async ({ page }) => {
        // Click Create Event
        await page.click('button:has-text("Создать мероприятие")');
        const modalTitle = page.locator('.ant-modal-title').filter({ hasText: 'Новое мероприятие' });
        await expect(modalTitle).toBeVisible();

        // Fill form
        await page.fill('input#name', 'Autotest Event 2026');
        
        // Date picker fill
        await page.locator('.ant-picker-input input').first().fill('01.01.2026');
        await page.keyboard.press('Tab');
        await page.locator('.ant-picker-input input').last().fill('02.01.2026');
        await page.keyboard.press('Enter');

        await page.fill('textarea#description', 'Created by Playwright');

        // Wait and save
        await page.waitForTimeout(1000);
        await page.click('.ant-modal-content button:has-text("OK")');

        // Verify modal closes
        await expect(modalTitle).toBeHidden();

        // System redirects to the event program on success, check URL
        await page.waitForURL('**/program');
        await expect(page.locator('text=Autotest Event 2026')).toBeVisible();

        // Check changing conference time (Bug replication)
        await page.goto('/events');
        const row = page.locator('tr').filter({ hasText: 'Autotest Event 2026' }).first();
        // Click the first action button on the right (usually edit) or navigate into it
        // Simpler: click the event link, then 'Настройки'
        await row.locator('a').first().click();
        await page.waitForURL('**/program'); // Wait till we navigate
        
        // Go to settings
        const settingsTab = page.locator('.ant-menu-title-content:has-text("Настройки"), a:has-text("Настройки")').first();
        if (await settingsTab.count() > 0) {
            await settingsTab.click();
            await page.waitForTimeout(1000);
            
            // Edit dates
            await page.locator('.ant-picker-input input').first().click();
            await page.locator('.ant-picker-input input').first().fill('15.05.2026');
            await page.keyboard.press('Enter');
            
            await page.waitForTimeout(500);
            await page.click('button:has-text("Сохранить")');
            
            // Verify notification or reload and check
            await page.waitForTimeout(1000);
            await page.reload();
            await expect(page.locator('.ant-picker-input input').first()).toHaveValue(/15.05.2026/);
        }
    });

    test('should verify SafeModalForm error validations on empty fields', async ({ page }) => {
        // Click Create Event but don't fill fields
        await page.goto('/events');
        await page.click('button:has-text("Создать мероприятие")');
        const modalTitle = page.locator('.ant-modal-title').filter({ hasText: 'Новое мероприятие' });
        await expect(modalTitle).toBeVisible();

        await page.waitForTimeout(1000);
        await page.click('.ant-modal-content button:has-text("OK"), .ant-modal-content button:has-text("Сохранить")');
        
        // It should NOT close, AND it should show Ant Validation styling
        await page.waitForTimeout(1000);
        await expect(modalTitle).toBeVisible();
        await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible();
        await page.click('.ant-modal-content button:has-text("Отмена")');
        await expect(modalTitle).toBeHidden();
    });
});
