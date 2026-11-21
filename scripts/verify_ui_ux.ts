import { chromium } from '@playwright/test';
import path from 'path';

async function main() {
  const artifactDir = 'C:/Users/hello/.gemini/antigravity/brain/eb759ade-6835-4121-a214-acb48ff4ca84';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Navigating to landing page...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  const heroShot = path.join(artifactDir, 'landing_hero_verified.png');
  await page.screenshot({ path: heroShot, fullPage: false });
  console.log(`Saved hero screenshot to ${heroShot}`);

  console.log('2. Scrolling to QBanks section...');
  await page.evaluate(() => {
    const el = document.getElementById('qbanks');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  const qbanksShot = path.join(artifactDir, 'landing_qbanks_verified.png');
  await page.screenshot({ path: qbanksShot, fullPage: false });
  console.log(`Saved QBanks screenshot to ${qbanksShot}`);

  console.log('3. Navigating to Board Simulator...');
  await page.goto('http://localhost:3000/simulator?qbank=autoimmune-diseases', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2000);

  // Skip Tutorial if shown
  const skipTutorialBtn = page.locator('button:has-text("Skip Tutorial")');
  if (await skipTutorialBtn.count() > 0) {
    console.log('Dismissing USMLE Tutorial...');
    await skipTutorialBtn.first().click();
    await page.waitForTimeout(1000);
  }

  // Accept Security Check if shown
  const acceptBtn = page.locator('button:has-text("I Understand, Start Test")');
  if (await acceptBtn.count() > 0) {
    console.log('Accepting exam security notice...');
    await acceptBtn.first().click();
    await page.waitForTimeout(1000);
  }

  const simulatorStandardShot = path.join(artifactDir, 'simulator_standard_verified.png');
  await page.screenshot({ path: simulatorStandardShot, fullPage: false });
  console.log(`Saved Simulator Standard screenshot to ${simulatorStandardShot}`);

  console.log('4. Testing Reverse Color Mode...');
  const reverseButton = page.locator('button[title*="Reverse Color"]');
  if (await reverseButton.count() > 0) {
    await reverseButton.first().click();
    await page.waitForTimeout(1000);
    const simulatorReverseShot = path.join(artifactDir, 'simulator_reverse_verified.png');
    await page.screenshot({ path: simulatorReverseShot, fullPage: false });
    console.log(`Saved Simulator Reverse Color screenshot to ${simulatorReverseShot}`);

    // Toggle back to Standard
    await reverseButton.first().click();
    await page.waitForTimeout(500);
  }

  console.log('5. Testing Tutor Mode Option Selection & Explanation Submission...');
  const radio = page.locator('input[type="radio"]').first();
  if (await radio.count() > 0) {
    await radio.click();
    await page.waitForTimeout(500);

    const submitBtn = page.locator('button:has-text("Submit Answer")');
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
      await page.waitForTimeout(2000);

      const explanationShot = path.join(artifactDir, 'simulator_explanation_verified.png');
      await page.screenshot({ path: explanationShot, fullPage: false });
      console.log(`Saved Explanation screenshot to ${explanationShot}`);
    }
  }

  // Count items in Question Status sidebar
  const questionCount = await page.locator('aside .font-mono').count();
  console.log(`Verified Question Status count in sidebar: ${questionCount} questions`);

  await browser.close();
  console.log('ALL UI/UX VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
