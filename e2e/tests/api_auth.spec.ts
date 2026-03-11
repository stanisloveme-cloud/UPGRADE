import { test, expect } from '@playwright/test';

// Use Playwright's request context to test REST endpoints directly, bypassing the UI
test.describe('API Health & Auth (TC-API-01)', () => {

    test('should authenticate and get user profile via API', async ({ request, baseURL }) => {
        // 1. Perform a POST request to Login endpoint
        const loginResp = await request.post('/auth/login', {
            data: {
                username: 'vladislav.shirobokov@gmail.com',
                password: '123456'
            }
        });

        // Verify status code is exactly 201 (NestJS default for POST) or 200
        expect([200, 201]).toContain(loginResp.status());

        // Under the hood, Playwright's `request` automatically stores the session cookies (e.g. connect.sid).
        // So subsequent requests made with this `request` context will be authenticated.

        // 2. Perform a GET request to verify session
        const profileResp = await request.get('/auth/profile');
        expect(profileResp.ok()).toBeTruthy();

        const profileData = await profileResp.json();
        expect(profileData).toHaveProperty('id');
        expect(profileData.username).toBe('vladislav.shirobokov@gmail.com');
    });

    test('should reject unauthorized access to protected endpoints', async ({ request }) => {
        // Without logging in beforehand, this request context has no cookies.
        const resp = await request.get('/api/events');
        expect(resp.status()).toBe(401); // Unauthorized
    });
});
