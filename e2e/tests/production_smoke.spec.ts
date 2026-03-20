import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests (Safe & Read-Only)', () => {
    // We only run this on Production!
    test.beforeEach(async ({ page }) => {
        // Enforce strong API error capturing to catch silent crashes on Prod
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400 && resp.status() !== 401) {
                const text = await resp.text().catch(() => '');
                console.log('PROD API ERROR:', resp.url(), resp.status(), text);
                expect(resp.status(), `Production API Error on ${resp.url()}: ${text}`).toBeLessThan(400);
            }
        });
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    });

    test('should login and navigate core modules without mutating data', async ({ page, baseURL }) => {
        test.setTimeout(90000); // Allow extra time for Prod network delays

        // Double check this is actually running on Production to prevent accidents
        expect(baseURL).toContain('erp-upgrade.ru');

        // 1. Navigate to the app
        await page.goto('/', { timeout: 60000, waitUntil: 'domcontentloaded' });

        // 2. Login
        await page.fill('#login_form_username', process.env.PROD_USER || 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', process.env.PROD_PASSWORD || '123456');
        await page.click('button[type="submit"]:has-text("Войти")');

        // Wait for successful login and redirect
        await page.waitForURL('**/events');
        await expect(page.locator('h1, .ant-page-header-heading-title').filter({ hasText: 'Мероприятия' })).toBeVisible();

        // 3. Open Modal but DO NOT SAVE
        await page.click('button:has-text("Создать мероприятие")');
        const modalTitle = page.locator('.ant-modal-title').filter({ hasText: 'Новое мероприятие' });
        await expect(modalTitle).toBeVisible();
        // SAFE CANCEL
        await page.click('.ant-modal-content button:has-text("Отмена"), .ant-modal-close');
        await expect(modalTitle).toBeHidden();

        // 4. Navigate to Speakers library
        await page.goto('/speakers');
        await expect(page.locator('text=Добавить спикера').first()).toBeVisible();

        // 5. Navigate to Halls library
        await page.goto('/settings/halls');
        await expect(page.locator('text=Все залы').first()).toBeVisible();

        // 6. Navigate to Users library
        await page.goto('/settings/users');
        await expect(page.locator('text=Менеджеры системы').first()).toBeVisible();
    });
});
