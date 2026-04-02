import { test, expect } from '@playwright/test';
import { apiValidator } from '../utils/apiValidator';

test.describe('CDD Double Trap Validation: Events', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.fill('#login_form_username', 'vladislav.shirobokov@gmail.com');
        await page.fill('#login_form_password', '123456');
        await page.click('button[type="submit"]:has-text("Войти")');
        await page.waitForURL('**/events');
    });

    test('should validate /api/events API schema via AJV Double Trap', async ({ page }) => {
        const responsePromise = page.waitForResponse(response => 
            response.url().includes('/api/events') && response.request().method() === 'GET' && response.status() === 200
        );

        // Reload to trigger fresh fetch
        await page.reload();

        // Wait for URL change back to events (if any) or just wait for the response
        await page.waitForURL('**/events*');
        
        // Capture JSON
        const response = await responsePromise;
        const trappedResponse = await response.json();

        expect(trappedResponse).not.toBeNull();
        
        const validation = apiValidator.validateResponse('/api/events', 'get', '200', trappedResponse);
        
        if (!validation.valid) {
            console.error('AJV Schema Validation Errors:', JSON.stringify(validation.errors, null, 2));
            
            // Log specifically if we detect the timeRange vs startTime mismatch mentioned in requirements
            if (trappedResponse?.items && trappedResponse.items.length > 0) {
                const sample = trappedResponse.items[0];
                console.error(`Payload debug: has timeRange: ${sample.timeRange !== undefined}, has startTime: ${sample.startTime !== undefined}`);
            }
        }
        
        expect(validation.valid, 'Double Trap API Validation Failed for /api/events! The backend response violated the openapi.json contract!').toBe(true);
    });
});
