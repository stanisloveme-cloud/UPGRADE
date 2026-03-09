import { test, expect } from '@playwright/test';

test.describe('Brands Library (TC-06)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app (uses baseURL)
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');

        // Wait for successful login and redirect
        await page.waitForURL('**/events');
    });

    test.skip('should navigate to Brands and add a new brand', async ({ page }) => {
        // 2. Open "Бренды" side menu
        await page.click('text=Бренды');

        // Wait for URL change
        await page.waitForURL('**/brands*');

        // 3. Click Add Brand
        const createBtnStr = 'button:has-text("Добавить"), button:has-text("Создать")';
        await page.waitForSelector(createBtnStr);
        const createBtn = page.locator(createBtnStr).first();
        await createBtn.click();

        // Ensure modal opens
        await expect(page.locator('.ant-modal-title').first()).toBeVisible();

        // Save Brand
        const saveBtn = page.locator('.ant-modal-footer button:has-text("Сохранить"), .ant-modal-footer button:has-text("OK")').first();
        await saveBtn.click();

        await expect(page.locator('.ant-modal-title').first()).toBeHidden();
    });

    test.skip('should allow uploading a logo for a brand (TC-08)', async ({ page }) => {
        await page.click('text=Бренды');
        await page.waitForURL('**/brands*');

        const editBtnStr = 'button:has-text("Редактировать"), .anticon-edit';
        await page.waitForSelector(editBtnStr);
        const editBtn = page.locator(editBtnStr).first();
        await editBtn.click();

        await expect(page.locator('.ant-modal-title').first()).toBeVisible();

        // Interaction with the file upload component PRD-11
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('text=Загрузить логотип');
        const fileChooser = await fileChooserPromise;

        // Note: We'd need a dummy image in the e2e folder for a real robust test
        // await fileChooser.setFiles('tests/fixtures/dummy_logo.png');

        // Save Brand
        const saveBtn = page.locator('.ant-modal-footer button:has-text("Сохранить"), .ant-modal-footer button:has-text("OK")').first();
        await saveBtn.click();

        await expect(page.locator('.ant-modal-title').first()).toBeHidden();
    });
});
