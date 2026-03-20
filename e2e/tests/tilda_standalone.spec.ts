import { test, expect } from '@playwright/test';

test.describe('Tilda Standalone Integration (TC-13)', () => {
    test.beforeEach(async ({ page }) => {
        // Intercept logs to debug silent fails
        page.on('response', async resp => {
            if (resp.url().includes('/api') && resp.status() >= 400) {
                console.log('API ERROR:', resp.url(), resp.status(), await resp.text());
            }
        });
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    });

    test('should successfully load Tilda standalone page for event 76 and display key elements', async ({ page }) => {
        // Navigate to the standalone HTML preview page representing a Tilda Zero Block
        await page.goto('/test-tilda-standalone.html?eventId=76');

        // Check that the schedule container exists
        const scheduleContainer = page.locator('#crm-schedule-root');
        await expect(scheduleContainer).toBeVisible({ timeout: 10000 });

        // Verify the dynamic data got populated by checking for the date toggle or track tabs
        const dateNav = page.locator('.sidebar-sticky h4').first();
        await expect(dateNav).toBeVisible();

        // 1. Verify Grid View Elements (Sessions)
        const sessionCard = page.locator('.custom-session-card').first();
        await expect(sessionCard).toBeVisible();
    });
});

