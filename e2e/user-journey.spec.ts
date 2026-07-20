import { test, expect } from '@playwright/test';

const testEmail = `e2e-${Date.now()}@example.com`;
const testPassword = 'Password123!';

test.describe('E2E User Journey', () => {
  let qbankSlug: string;

  test.beforeAll(async ({ request }) => {
    // 1. Create the test user and grant access via the API
    const response = await request.post('/api/e2e/setup', {
      data: { email: testEmail, password: testPassword }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    qbankSlug = data.qbankSlug;
  });

  test.afterAll(async ({ request }) => {
    // Teardown: delete test user
    const response = await request.post('/api/e2e/teardown', {
      data: { email: testEmail }
    });
    expect(response.ok()).toBeTruthy();
  });

  test('Complete journey: Login -> Dashboard -> Test -> Submit', async ({ page }) => {
    test.setTimeout(60000); // Allow 60s for Next.js to compile pages on the fly

    // 1. Login
    await page.goto('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');

    // Wait and check if there's an error message
    const errorBanner = page.locator('.bg-red-50.text-red-600');
    if (await errorBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await errorBanner.innerText();
      throw new Error(`Login failed with error: ${text}`);
    }

    // Wait for redirect to dashboard
    try {
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: 'login-timeout.png', fullPage: true });
      throw e;
    }

    // 2. Go to QBank Dashboard
    await page.goto(`/dashboard/${qbankSlug}`);
    await expect(page.locator('h1')).toContainText('QBank');

    // Bypass tutorial for E2E tests
    await page.addInitScript(() => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function(key) {
        if (key && key.startsWith('tutorial-seen-')) return 'true';
        return originalGetItem.call(this, key);
      };
    });

    // 3. Start a Timed Block
    await page.goto(`/dashboard/${qbankSlug}/setup?mode=timed`);
    await page.click('button:has-text("Start Block")');

    // Wait for TestPlayer to load
    await expect(page).toHaveURL(/.*\/test\/.*/, { timeout: 30000 });
    
    // Handle security warning overlay
    const securityBtn = page.locator('button:has-text("I Understand, Start Test")');
    await securityBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    if (await securityBtn.isVisible()) {
      await securityBtn.click();
    }

    await expect(page.locator('text="What is 2 + 2?"')).toBeVisible({ timeout: 30000 });

    // 4. Select an answer
    // Wait for options to render
    const option = page.locator('text="4"');
    await expect(option).toBeVisible();
    await option.click();
    
    // Wait for saving spinner to disappear, or just submit
    // (Our autosave happens in background, finish block button submits)
    
    // 5. Submit the test
    page.on('dialog', async dialog => await dialog.accept());
    const finishButton = page.locator('button', { hasText: 'End Block' }).first();
    await finishButton.click();
    
    // Handle omission warning overlay if it appears
    const proceedBtn = page.locator('button:text-is("Proceed")').first();
    if (await proceedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await proceedBtn.click();
    }

    // Wait for results
    await expect(page).toHaveURL(/.*\/results/, { timeout: 30000 });
    
    // Verify Results Page
    await expect(page.locator('text=Score')).toBeVisible();
  });
});
