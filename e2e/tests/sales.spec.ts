import { test, expect } from '@playwright/test';

test.describe('Sales Section Placeholder (TC-11)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');
        await page.waitForURL('**/events');
    });

    test('should navigate to Sales', async ({ page }) => {
        await page.click('text=Продажи');
        await page.waitForURL('**/sales*');
        // Since it's a placeholder, just verify something loads without crashing
        await expect(page.locator('body')).toBeVisible();
    });
});
