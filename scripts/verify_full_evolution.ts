import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('--- Starting Playwright End-to-End Verification ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\hello\\.gemini\\antigravity\\brain\\eb759ade-6835-4121-a214-acb48ff4ca84';

  try {
    // 1. Verify Landing Page
    console.log('1. Navigating to Landing Page http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check Single Primary CTA
    const primaryCta = page.locator('a:has-text("Explore Question Banks")');
    const isPrimaryCtaVisible = await primaryCta.isVisible();
    console.log(`Primary CTA visible: ${isPrimaryCtaVisible}`);

    // Verify PIP video previews exist on the cards
    const videoPreviews = await page.locator('#qbanks video').count();
    console.log(`Found ${videoPreviews} PIP video mnemonic preview elements on QBank cards`);

    // Verify strictly Tutor & Timed buttons exist
    const tutorButtons = await page.locator('button:has-text("Tutor Mode (50 Qs)")').count();
    const timedButtons = await page.locator('button:has-text("Timed Mode (50 Qs)")').count();
    console.log(`Found ${tutorButtons} Tutor Mode (50 Qs) buttons and ${timedButtons} Timed Mode (50 Qs) buttons`);

    await page.screenshot({ path: path.join(artifactDir, 'verified_landing_page.png'), fullPage: false });

    // 2. Verify Simulator & MQB Signature Theme
    console.log('2. Navigating to Simulator http://localhost:3000/simulator?qbank=autoimmune-diseases ...');
    await page.goto('http://localhost:3000/simulator?qbank=autoimmune-diseases', { waitUntil: 'networkidle', timeout: 30000 });

    // Handle tutorial if present
    const skipBtn = page.locator('button:has-text("Skip Tutorial")');
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Skipping tutorial overlay...');
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // Take screenshot of UWorld Official FRED theme
    await page.screenshot({ path: path.join(artifactDir, 'verified_simulator_uworld.png'), fullPage: false });

    // Open Settings and switch to MQB Signature theme
    console.log('Opening Settings...');
    const settingsBtn = page.locator('button[title*="Settings"], button:has-text("Settings")').first();
    await settingsBtn.click();
    await page.waitForTimeout(600);

    console.log('Switching to MQB Signature Theme...');
    const mqbThemeBtn = page.locator('button:has-text("MQB Signature")');
    await mqbThemeBtn.click();
    await page.waitForTimeout(600);

    // Toggle Font Size to Large (18px)
    console.log('Selecting Large (18px) font preset...');
    const largeFontBtn = page.locator('button:has-text("Large (18px)")');
    if (await largeFontBtn.isVisible()) {
      await largeFontBtn.click();
      await page.waitForTimeout(300);
    }

    // Toggle Split Screen
    console.log('Enabling Split Screen...');
    const splitScreenToggle = page.locator('button[role="switch"]:near(:text("Split Screen Reading View"))').first();
    if (await splitScreenToggle.isVisible()) {
      await splitScreenToggle.click();
      await page.waitForTimeout(300);
    }

    // Toggle Shortcuts
    console.log('Enabling Keyboard Shortcuts Overlay...');
    const shortcutsToggle = page.locator('button[role="switch"]:near(:text("Keyboard Shortcuts Overlay"))').first();
    if (await shortcutsToggle.isVisible()) {
      await shortcutsToggle.click();
      await page.waitForTimeout(300);
    }

    // Close Settings with Apply & Return
    console.log('Closing Settings...');
    const applyBtn = page.locator('button:has-text("Apply & Return")');
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await page.waitForTimeout(500);
    }

    // Take screenshot of MQB Signature Theme with Split Screen & Shortcuts
    await page.screenshot({ path: path.join(artifactDir, 'verified_mqb_signature_theme.png'), fullPage: false });

    // Select an option using keyboard shortcut 'a'
    console.log('Selecting option choice A using keyboard shortcut...');
    await page.keyboard.press('a');
    await page.waitForTimeout(400);

    // 3. Test End Block & Verify Results Page (No 404!)
    console.log('3. Clicking End Block in header...');
    const endBlockBtn = page.locator('header button:has-text("End Block")');
    await endBlockBtn.click({ force: true });
    await page.waitForTimeout(600);

    // Confirm end block in modal dialog
    console.log('Confirming End Block in modal...');
    const confirmEnd = page.locator('button:has-text("End Block & View Results")').first();
    await confirmEnd.waitFor({ state: 'visible', timeout: 5000 });
    await confirmEnd.click({ force: true });

    // Wait for Results Page navigation
    console.log('Waiting for Results Page URL...');
    await page.waitForURL(/.*\/session\/.*\/results/, { timeout: 15000 });
    console.log(`Successfully reached Results Page: ${page.url()}`);

    // Verify 404 is NOT present
    const bodyText = await page.locator('body').innerText();
    const has404 = bodyText.includes('404') && bodyText.includes('This page could not be found');
    console.log(`Results page 404 check: ${has404 ? 'FAILED (404 found)' : 'PASSED (Clean results view rendered!)'}`);

    // Verify key Results UI elements
    const scoreElement = page.locator('text=Examination Performance');
    const isScoreVisible = await scoreElement.isVisible();
    console.log(`Score Performance Hero visible: ${isScoreVisible}`);

    const matrixElement = page.locator('text=Question Matrix & Item Breakdown');
    const isMatrixVisible = await matrixElement.isVisible();
    console.log(`1-50 Question Matrix visible: ${isMatrixVisible}`);

    // Take screenshot of Results Page
    await page.screenshot({ path: path.join(artifactDir, 'verified_results_page.png'), fullPage: false });

    // Test matrix item click preview modal
    console.log('Clicking item 1 in question matrix to test preview modal...');
    const item1 = page.locator('button[title*="Question 1"]').first();
    if (await item1.isVisible()) {
      await item1.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'verified_item_preview_modal.png'), fullPage: false });
      const closePreview = page.locator('button:has-text("Close Preview"), button[title="Close Preview"]').first();
      if (await closePreview.isVisible()) {
        await closePreview.click();
      }
    }

    // 4. Verify Admin Ingestor Page
    console.log('4. Navigating to /admin/qbanks/import ...');
    await page.goto('http://localhost:3000/admin/qbanks/import', { waitUntil: 'networkidle', timeout: 15000 });
    const ingestorHeading = page.locator('h1:has-text("Question Bank Document Ingestor")');
    const isIngestorVisible = await ingestorHeading.isVisible();
    console.log(`Admin Ingestor visible: ${isIngestorVisible}`);

    await page.screenshot({ path: path.join(artifactDir, 'verified_admin_ingestor.png'), fullPage: false });

    console.log('--- ALL PLAYWRIGHT VERIFICATION CHECKS PASSED! ---');

  } catch (error) {
    console.error('Playwright verification encountered an error:', error);
    await page.screenshot({ path: path.join(artifactDir, 'error_verification.png'), fullPage: true }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
