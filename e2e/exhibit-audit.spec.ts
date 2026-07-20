import { test, expect } from '@playwright/test';

const testEmail = `exhibit-${Date.now()}@example.com`;
const testPassword = 'Password123!';

test.describe('Exhibit Display Audit', () => {
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

  test('Should open the exhibit modal when image is clicked', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Login
    await page.goto('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });

    // 2. Go to QBank Dashboard and start a Timed Block
    await page.goto(`/dashboard/${qbankSlug}`);
    await page.addInitScript(() => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function(key) {
        if (key && key.startsWith('tutorial-seen-')) return 'true';
        return originalGetItem.call(this, key);
      };
    });
    await page.goto(`/dashboard/${qbankSlug}/setup?mode=timed`);
    await page.click('button:has-text("Start Block")');

    // Wait for TestPlayer to load
    await expect(page).toHaveURL(/.*\/test\/.*/, { timeout: 30000 });

    // Handle security warning overlay
    const securityBtn = page.locator('button:has-text("I Understand, Start Test")');
    await securityBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await securityBtn.isVisible()) {
      await securityBtn.click();
    }

    // Wait for the question text and image to be visible
    await expect(page.locator('text="What is 2 + 2?"')).toBeVisible({ timeout: 30000 });
    
    // Find the button element which has the exhibit-trigger class
    const exhibitImage = page.locator('button.exhibit-trigger').first();
    await expect(exhibitImage).toBeVisible();

    // Click the image
    await exhibitImage.click();

    // Verify the modal appears
    const modalRoot = page.locator('#exhibit-display-root');
    await expect(modalRoot).toBeVisible({ timeout: 5000 });
    
    // Verify the zoomed image is visible inside the modal
    const zoomedImg = modalRoot.locator('img').first();
    await expect(zoomedImg).toBeVisible();
    
    // Verify it is NOT pointer-events-none (we can click the close button)
    const closeBtn = modalRoot.locator('button[title="Close (Esc)"]').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    
    // Verify modal is closed
    await expect(modalRoot).toBeHidden();
  });
});
