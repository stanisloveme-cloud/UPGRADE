import { test, expect } from '@playwright/test';

test.describe('Speakers Management (TC-08)', () => {
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

    test('should open speakers page, create, and verify a speaker', async ({ page }) => {
        // Navigate to Speakers
        await page.goto('/speakers');
        await page.waitForSelector('.ant-page-header-heading-title:has-text("Спикеры")');

        // Click Add Speaker
        await page.click('button:has-text("Добавить спикера")');
        const modalTitle = page.locator('.ant-modal-title').filter({ hasText: 'Добавить спикера' });
        await expect(modalTitle).toBeVisible();

        // Fill form
        await page.fill('input#firstName', 'Автотест');
        await page.fill('input#lastName', 'Спикеров');
        await page.fill('input#company', 'Test Company');
        await page.fill('input#position', 'SDET');
        await page.fill('input#email', 'autotest_speaker@example.com');
        await page.fill('input#telegram', '@autotest_speaker');

        // Human-like delay and save
        await page.waitForTimeout(1000);
        await page.click('.ant-modal-content button:has-text("OK")');

        // Verify modal closes
        await expect(modalTitle).toBeHidden();

        // Verify the speaker appears in the list
        await expect(page.locator('text=Спикеров Автотест')).toBeVisible();
        await expect(page.locator('text=Test Company')).toBeVisible();
    });
});
