import { test, expect } from '@playwright/test';

test.describe('Users Management (TC-10)', () => {
    test.beforeEach(async ({ page }) => {
        // Intercept logs
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400) {
                console.log('API ERROR:', resp.url(), resp.status(), await resp.text());
            }
        });
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

        // Login
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');
        await page.waitForURL('**/events');
    });

    test('should open users page, create, and verify a new user', async ({ page }) => {
        // Navigate to Users
        await page.goto('/settings/users');
        await page.waitForSelector('text=Менеджеры системы');

        // Click Create Manager
        await page.click('button:has-text("Создать менеджера")');
        const modalTitle = page.locator('.ant-modal-title, .ant-drawer-title').filter({ hasText: 'Новый менеджер' });
        await expect(modalTitle).toBeVisible();

        const randomStr = Math.random().toString(36).substring(7);
        const username = `autotest_${randomStr}`;

        // Fill form
        await page.fill('input#firstName', 'Авто');
        await page.fill('input#lastName', 'Тестер');
        await page.fill('input#username', username);
        await page.fill('input#email', `${username}@example.com`);
        await page.fill('input#password', 'password123');

        // Select the first event from the multiselect 
        // Need to click to open dropdown, then select first item
        await page.click('input#eventIds');
        await page.waitForTimeout(500); 
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        // Wait and save
        await page.waitForTimeout(1000);
        await page.click('.ant-modal-content button:has-text("OK")');

        // Verify modal closes
        await expect(modalTitle).toBeHidden();

        // Verify the user appears in the list
        await expect(page.locator(`text=${username}`).first()).toBeVisible();
    });
});
