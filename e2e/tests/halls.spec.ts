import { test, expect } from '@playwright/test';

test.describe('Halls Management (TC-01)', () => {
    test.beforeEach(async ({ page }) => {
        // Intercept logs to debug silent fails
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400) {
                console.log('API ERROR:', resp.url(), resp.status(), await resp.text());
            }
        });
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

        // 1. Navigate to the app (uses baseURL from playwright.config.ts)
        await page.goto('/');

        // 2. Login
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');

        // Wait for successful login and redirect
        await page.waitForURL('**/events');
    });

    test('should open halls management modal and add a new hall', async ({ page }) => {
        // 3. Go to Program of the first event (assuming Retail Tech 2026 or similar is present)
        await page.waitForSelector('button:has-text("Программа")');
        await page.click('button:has-text("Программа")');

        // 4. Click "Управление залами" (from PRD 02, it is a button with a gear icon)
        await page.waitForSelector('text=Управление залами');
        await page.click('button:has-text("Управление залами"), span:has-text("Управление залами")');

        // 5. Wait for Drawer or Modal to open
        const modalTitle = page.locator('.ant-modal-title, .ant-drawer-title').filter({ hasText: 'Управление залами' });
        await expect(modalTitle).toBeVisible();

        // 6. Click "+ Добавить зал"
        await page.click('button:has-text("+ Добавить зал")');

        // 7. Fill the hall name for the newly added row
        const newHallInput = page.getByPlaceholder('Название зала').last();
        await newHallInput.fill('Автотест Зал');

        // 8. Click Save/Submit by triggering the native HTML5 form submission
        // 8. Click "Сохранить" using standard Playwright click
        await page.waitForTimeout(1000); // Wait for React state to settle after fill
        await page.click('.ant-modal-content button:has-text("Сохранить")');

        // 9. Verify the drawer/modal closes
        await expect(modalTitle).toBeHidden();

        // 10. Verify the new hall appears in the Grid
        await expect(page.locator('text=Автотест Зал')).toBeVisible();
    });
});
