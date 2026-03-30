import { test, expect } from '@playwright/test';
import { apiValidator } from '../utils/apiValidator';

test.describe('CDD Double Trap Validation: Sponsors', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app (uses baseURL)
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');

        // Wait for successful login and redirect
        await page.waitForURL('**/events');
    });

    test('should validate /api/sponsors/all API schema via AJV Double Trap', async ({ page }) => {
        // Set up the API Trap
        const responsePromise = page.waitForResponse(response => 
            response.url().includes('/api/sponsors/all') && response.request().method() === 'GET' && response.status() === 200
        );

        // 2. Open "Бренды" side menu to trigger the fetch
        await page.click('text=Бренды');

        // Wait for URL change
        await page.waitForURL('**/brands*');
        
        // Ensure network request finishes and capture JSON
        const response = await responsePromise;
        const trappedResponse = await response.json();

        // Validate the trapped response against the OpenAPI schema 
        // Our endpoint in Swagger is /api/sponsors/all, Method: get, Code: 200
        expect(trappedResponse).not.toBeNull();
        
        const validation = apiValidator.validateResponse('/api/sponsors/all', 'get', '200', trappedResponse);
        
        if (!validation.valid) {
            console.error('AJV Schema Validation Errors:', validation.errors);
        }
        
        expect(validation.valid, 'Double Trap API Validation Failed! The backend response violated the openapi.json contract!').toBe(true);
    });
});
