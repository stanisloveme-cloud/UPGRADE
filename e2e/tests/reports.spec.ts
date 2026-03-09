import { test, expect } from '@playwright/test';

test.describe('Excel Reports Generation (TC-07)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app (uses baseURL)
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');

        // Wait for successful login and redirect
        await page.waitForURL('**/events');
    });

    test.skip('should download the program grid report', async ({ page }) => {
        // Navigate to the grid
        await page.waitForSelector('button:has-text("Программа")');
        await page.click('button:has-text("Программа")');

        // Wait for grid to load
        await expect(page.locator('.ant-pro-card')).toBeVisible();

        // Find the "Скачать отчет" button for the program
        const downloadPromise = page.waitForEvent('download');

        // Assuming there's a specific button text or icon for downloading
        // Fallback to searching by text content based on typical Ant Design Pro UI
        const downloadBtnStr = 'button:has-text("Скачать отчет"), button:has-text("Экспорт")';
        await page.waitForSelector(downloadBtnStr);
        const downloadBtn = page.locator(downloadBtnStr).first();
        await downloadBtn.click();

        const download = await downloadPromise;
        // Verify it downloads an excel file
        expect(download.suggestedFilename()).toMatch(/\.xlsx$|\.xls$/i);
    });

    test.skip('should download the speaker badges report', async ({ page }) => {
        // Navigate to Speakers
        await page.click('a[href$="/speakers"], span:has-text("Спикеры")');
        await page.waitForURL('**/speakers');

        const downloadPromise = page.waitForEvent('download');

        const downloadBtnStr = 'button:has-text("Скачать бейджи"), button:has-text("Отчет по бейджам")';
        await page.waitForSelector(downloadBtnStr);
        const downloadBtn = page.locator(downloadBtnStr).first();
        await downloadBtn.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.xlsx$|\.xls$/i);
    });
});
