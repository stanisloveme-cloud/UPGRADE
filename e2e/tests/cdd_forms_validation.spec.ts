import { test, expect } from '@playwright/test';

test.describe('UI Vulnerabilities: Silent UI Fails (SafeDrawerForm)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');
        await page.waitForURL('**/events');
    });

    test('should display red error Toast when form submission fails (Anti Silent Fail)', async ({ page }) => {
        // Setup API mock to force a 400 error on saving a new event
        await page.route('**/api/events', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        statusCode: 400,
                        message: ['Validation error: server rejected the payload'],
                        error: 'Bad Request'
                    })
                });
            } else {
                await route.continue();
            }
        });

        // Click Create Event
        await page.click('button:has-text("Создать мероприятие")');
        const modalTitle = page.locator('.ant-modal-title').filter({ hasText: 'Новое мероприятие' });
        await expect(modalTitle).toBeVisible();

        // Fill form with valid data (to pass frontend validation)
        await page.fill('input#name', 'Test Mock Failure Event');
        await page.locator('.ant-picker-input input').first().fill('01.01.2026');
        await page.keyboard.press('Tab');
        await page.locator('.ant-picker-input input').last().fill('02.01.2026');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        // Submit form
        await page.click('.ant-modal-content button:has-text("OK")');

        // Verify that a Toast (ant-message or notification) appears containing the exact error
        // ant-message-error is specifically for red toasts in Ant Design
        const errorMessage = page.locator('.ant-message-error, .ant-notification-notice-error');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        
        // Assert the modal did NOT close silently
        await expect(modalTitle).toBeVisible();
    });
});
