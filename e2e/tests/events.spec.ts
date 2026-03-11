import { test, expect } from '@playwright/test';

test.describe('Events Management (TC-09)', () => {
    test.beforeEach(async ({ page }) => {
        // Intercept logs to debug silent fails
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400) {
                console.log('API ERROR:', resp.url(), resp.status(), await resp.text());
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
    });
});
