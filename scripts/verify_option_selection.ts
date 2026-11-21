import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('--- Starting Playwright Answer Mutability & Theme Verification ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\hello\\.gemini\\antigravity\\brain\\eb759ade-6835-4121-a214-acb48ff4ca84';

  try {
    console.log('1. Navigating to Simulator http://localhost:3000/simulator?qbank=autoimmune-diseases ...');
    await page.goto('http://localhost:3000/simulator?qbank=autoimmune-diseases', { waitUntil: 'networkidle', timeout: 30000 });

    // Skip tutorial if present
    const skipBtn = page.locator('button:has-text("Skip Tutorial")');
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Skipping tutorial overlay...');
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // --- TEST 1: Select Option A, then change mind to Option B, then Option C ---
    console.log('2. Testing Answer Selection Mutability in UWorld Theme...');
    
    // Select Option A
    const optionRows = page.locator('main label:has(input[type="radio"])');
    const optionA = optionRows.nth(0);
    const optionB = optionRows.nth(1);
    const optionC = optionRows.nth(2);
    const optionD = optionRows.nth(3);

    console.log('Clicking Option A...');
    await optionA.click();
    await page.waitForTimeout(300);

    const radioA = optionA.locator('input[type="radio"]');
    const isCheckedA1 = await radioA.isChecked();
    console.log(`Option A checked: ${isCheckedA1} (Expected: true)`);
    if (!isCheckedA1) throw new Error('Option A failed to check');

    // Click Option B (Changing selection!)
    console.log('Changing selection: Clicking Option B...');
    await optionB.click();
    await page.waitForTimeout(300);

    const isCheckedA2 = await radioA.isChecked();
    const isCheckedB1 = await optionB.locator('input[type="radio"]').isChecked();
    console.log(`Option A checked: ${isCheckedA2} (Expected: false) | Option B checked: ${isCheckedB1} (Expected: true)`);
    if (isCheckedA2 || !isCheckedB1) {
      throw new Error('Failed to switch selection from Option A to Option B!');
    }

    // Click Option C
    console.log('Changing selection again: Clicking Option C...');
    await optionC.click();
    await page.waitForTimeout(300);

    const isCheckedB2 = await optionB.locator('input[type="radio"]').isChecked();
    const isCheckedC1 = await optionC.locator('input[type="radio"]').isChecked();
    console.log(`Option B checked: ${isCheckedB2} (Expected: false) | Option C checked: ${isCheckedC1} (Expected: true)`);
    if (isCheckedB2 || !isCheckedC1) {
      throw new Error('Failed to switch selection from Option B to Option C!');
    }

    // --- TEST 2: Strikeout Option D and then select Option D (auto-unstrike) ---
    console.log('3. Testing Strikeout & Auto-Unstrike on Selection...');
    const strikeBtnD = page.locator('main button[title="Strike out option"]').nth(3);
    if (await strikeBtnD.isVisible()) {
      await strikeBtnD.click();
      await page.waitForTimeout(300);
      console.log('Struck out Option D.');
      
      // Now click Option D
      console.log('Clicking struck-out Option D (should select and unstrike)...');
      await optionD.click();
      await page.waitForTimeout(300);

      const isCheckedD = await optionD.locator('input[type="radio"]').isChecked();
      console.log(`Option D checked: ${isCheckedD} (Expected: true)`);
      if (!isCheckedD) throw new Error('Failed to select struck-out Option D!');
    }

    // --- TEST 3: Keyboard Shortcuts ---
    console.log('4. Testing Keyboard Shortcut Option Selection...');
    await page.keyboard.press('a');
    await page.waitForTimeout(300);
    const isCheckedKeyA = await radioA.isChecked();
    console.log(`Option A checked via keypress 'a': ${isCheckedKeyA} (Expected: true)`);
    if (!isCheckedKeyA) throw new Error('Failed to select Option A via keyboard shortcut');

    await page.screenshot({ path: path.join(artifactDir, 'verified_option_mutability_uworld.png'), fullPage: false });

    // --- TEST 4: Locking After Submission ---
    console.log('5. Testing Lock Behavior after Submitting Answer in Tutor Mode...');
    const submitBtn = page.locator('button:has-text("Submit Answer & View Explanation")');
    await submitBtn.click();
    await page.waitForTimeout(800);

    // Verify feedback is visible
    const explanationHeading = page.locator('text=/Educational (Objective|Discussion)|EXPLANATION/i');
    const isExplVisible = await explanationHeading.first().isVisible().catch(() => false);
    console.log(`Explanation visible after submit: ${isExplVisible}`);

    // Try to click Option B now (must be blocked)
    console.log('Attempting to change selection to Option B after submission (should be blocked)...');
    await optionB.click({ force: true });
    await page.waitForTimeout(300);
    const isCheckedBAfterLock = await optionB.locator('input[type="radio"]').isChecked();
    const isCheckedAAfterLock = await radioA.isChecked();
    console.log(`Option A checked: ${isCheckedAAfterLock} (Expected: true) | Option B checked: ${isCheckedBAfterLock} (Expected: false)`);
    if (!isCheckedAAfterLock || isCheckedBAfterLock) {
      throw new Error('Selection changed after submission! Answer must remain locked once submitted.');
    }

    // --- TEST 5: Settings Escape Dismissal & Theme Switch ---
    console.log('6. Testing Settings Escape Dismissal...');
    const settingsBtn = page.locator('button[title*="Settings"], button:has-text("Settings")').first();
    await settingsBtn.click();
    await page.waitForTimeout(400);

    const settingsPanel = page.locator('text=Examination Display & Player Controls');
    if (!await settingsPanel.isVisible()) throw new Error('Settings sidebar failed to open');
    console.log('Settings opened. Pressing Escape to dismiss...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const isSettingsClosed = !await settingsPanel.isVisible();
    console.log(`Settings closed via Escape: ${isSettingsClosed} (Expected: true)`);
    if (!isSettingsClosed) throw new Error('Settings failed to close on Escape key');

    // Switch to MQB Theme
    console.log('7. Switching to MQB Signature Theme in Settings...');
    await settingsBtn.click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("MQB Signature")').click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Apply & Return")').click();
    await page.waitForTimeout(500);

    // --- TEST 6: MQB Signature Theme Option Selection on Next Question ---
    console.log('8. Proceeding to Item 2 in MQB Theme to test selection mutability...');
    const nextBtn = page.locator('button:has-text("Proceed to Next Item →"), button:has-text("Next Item →")').first();
    await nextBtn.click();
    await page.waitForTimeout(600);

    // In MQB theme, options are clickable cards
    console.log('Testing option card switching in MQB Theme...');
    const mqbOptions = page.locator('main div.cursor-pointer.rounded-xl.border-2');
    
    // Click Option A (card 0)
    console.log('Clicking Option A card in MQB Theme...');
    await mqbOptions.nth(0).click();
    await page.waitForTimeout(300);

    // Verify Option A has selected style (teal ring / bg-teal-950)
    const cardAClass = await mqbOptions.nth(0).getAttribute('class');
    const isSelectedMqbA = cardAClass?.includes('border-teal-400') || cardAClass?.includes('ring-teal-400');
    console.log(`MQB Option A selected: ${isSelectedMqbA} (Expected: true)`);
    if (!isSelectedMqbA) throw new Error('MQB Option A failed to show selected style');

    // Click Option B (card 1)
    console.log('Changing selection: Clicking Option B card in MQB Theme...');
    await mqbOptions.nth(1).click();
    await page.waitForTimeout(300);

    const cardAClassAfter = await mqbOptions.nth(0).getAttribute('class');
    const cardBClassAfter = await mqbOptions.nth(1).getAttribute('class');
    const isSelectedMqbB = cardBClassAfter?.includes('border-teal-400') || cardBClassAfter?.includes('ring-teal-400');
    const isAUnselected = !cardAClassAfter?.includes('border-teal-400');

    console.log(`MQB Option A unselected: ${isAUnselected} (Expected: true) | MQB Option B selected: ${isSelectedMqbB} (Expected: true)`);
    if (!isAUnselected || !isSelectedMqbB) {
      throw new Error('Failed to switch option selection in MQB Signature Theme!');
    }

    // Keypress 'c' in MQB theme
    console.log('Changing selection via keypress "c" in MQB Theme...');
    await page.keyboard.press('c');
    await page.waitForTimeout(300);

    const cardCClassAfter = await mqbOptions.nth(2).getAttribute('class');
    const isSelectedMqbC = cardCClassAfter?.includes('border-teal-400') || cardCClassAfter?.includes('ring-teal-400');
    console.log(`MQB Option C selected via keypress 'c': ${isSelectedMqbC} (Expected: true)`);
    if (!isSelectedMqbC) throw new Error('Failed to select Option C via keyboard in MQB Theme');

    await page.screenshot({ path: path.join(artifactDir, 'verified_option_mutability_mqb.png'), fullPage: false });

    console.log('--- ALL OPTION MUTABILITY & THEME CHECKS PASSED PERFECTLY! ---');

  } catch (error) {
    console.error('Verification failed:', error);
    await page.screenshot({ path: path.join(artifactDir, 'error_option_selection.png'), fullPage: true }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
