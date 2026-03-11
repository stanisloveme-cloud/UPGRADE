---
description: How to run, extend, and debug Playwright E2E UI and API auto-tests on the DevStand environment
---

# E2E UI & API Testing Workflow (DevStand)

This workflow outlines how to execute, debug, and extend end-to-end UI and API tests for the UPGRADE CRM project on the DevStand environment. It is critical to continuously test both frontend UI elements and backend REST endpoints on the production-like DevStand to catch silent failures and regression bugs.

## Prerequisites

All test files are located in `d:\UPGRADE\e2e\tests`. The Playwright configuration is located at `d:\UPGRADE\e2e\playwright.config.ts`.
The tests are configured with multiple projects. To target the DevStand, we use the `devstand` project, which maps to `https://devupgrade.space4you.ru`.

## 1. Running the Tests

To run the entire UI test suite against the DevStand, execute the following command:

// turbo
```bash
cd d:\UPGRADE\e2e && npx playwright test --project=devstand --reporter=list
```

## 2. Writing and Extending Tests

When adding new features or fixing UI bugs, you MUST add or update corresponding test cases. 
Follow these mandatory guidelines to ensure reliable UI testing:

1. **Test Real User Behavior**: Do not use `form.submit()` or `form.requestSubmit()` via `page.evaluate()`. This bypasses React and Ant Design's native event handlers.
   - **WRONG:** `await page.evaluate(() => document.querySelector('form').requestSubmit());`
   - **CORRECT:** `await page.click('button:has-text("Сохранить")');`

2. **Wait for React State**: UI components (like Modals and Drawers) have transition animations and state updates. Always give React a moment to settle after filling inputs and before clicking buttons.
   - Example: `await page.waitForTimeout(1000);` 

3. **Verify Feedback**: After clicking a Save or Submit button, always verify the result:
   - If success is expected: verify that the Modal/Drawer closes with `await expect(locator).toBeHidden();` AND verify the data appears in the UI.
   - If validation errors are expected: verify the error message is visible.

4. **Intercept and Log Errors**: In your `test.beforeEach` or inside individual tests, intercept server errors and browser console logs to make debugging easier for the next agent:
   ```typescript
   page.on('response', async resp => {
       if (resp.url().includes('/api') && resp.status() >= 400) {
           console.log('API ERROR:', resp.url(), resp.status(), await resp.text());
       }
   });
   page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
   ```

## 3. Writing and Extending API Tests

Playwright is also used for testing the backend REST API directly. You can find examples of API tests in `d:\UPGRADE\e2e\tests\api_auth.spec.ts`.

1. **Use `request` Fixture**: Instead of the `{ page }` object, use the `{ request }` object in your test definitions:
   `test('should fetch events', async ({ request }) => { ... })`
2. **Session Persistence**: When testing private endpoints, first call `await request.post('/api/auth/login', { ... })`. Playwright will automatically store the session cookies (`connect.sid`) for all subsequent API requests in that test block.
3. **Verify Status and JSON**: Always verify `expect(resp.ok()).toBeTruthy();` and check the payload structure.

## 4. Investigating Failures

If a test fails on the DevStand:
1. Check the console output from the `--reporter=list` for exactly which assertion failed.
2. Read the `API ERROR` and `BROWSER CONSOLE` logs that should be printed by the intercepts.
3. If necessary, write a temporary debug test that takes screenshots: `await page.screenshot({ path: 'debug.png', fullPage: true });`
4. Inspect the target components in the React source code (`client/src/...`) to see if an `onFinish`, `onClick`, or `submitterProps.submit()` is missing or broken, a common issue with Ant Design Pro custom submitters.
