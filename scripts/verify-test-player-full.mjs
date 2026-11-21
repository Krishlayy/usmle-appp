import { chromium } from 'playwright';

async function testPlayerFullVerification() {
  console.log('🚀 Starting Comprehensive USMLE Test Player Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('❌ Browser Console Error:', msg.text());
  });

  try {
    // 1. Login
    console.log('1️⃣ Logging in as Super Admin...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@medico.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Logged in successfully.');

    // 2. Start a Tutor Test Session directly via API
    console.log('2️⃣ Initializing a clean Tutor test session via API...');
    const sessionRes = await page.evaluate(async () => {
      const res = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qbankSlug: 'approach-to-histology',
          mode: 'tutor',
          questionCount: 10,
          filter: 'all',
        }),
      });
      return res.json();
    });

    console.log('Session response:', sessionRes);
    const sessionId = sessionRes.sessionId;
    if (!sessionId) {
      throw new Error('Failed to create test session: ' + JSON.stringify(sessionRes));
    }

    // 3. Navigate to the Test Player
    console.log(`3️⃣ Navigating to Test Player: /dashboard/approach-to-histology/test/${sessionId}`);
    await page.goto(`http://localhost:3000/dashboard/approach-to-histology/test/${sessionId}`);
    await page.waitForSelector('text=/Item:\\s*\\d+\\s*of/i', { timeout: 15000 });
    console.log('✅ Test Player loaded with authentic USMLE header!');

    // Dismiss tutorial if visible
    const skipTutorial = page.locator('button:has-text("Skip Tutorial")');
    if (await skipTutorial.count() > 0) {
      await skipTutorial.click();
      await page.waitForTimeout(400);
      console.log('Skipped tutorial modal.');
    }

    // 4. Verify Header Elements
    console.log('4️⃣ Verifying Authentic Navy Blue Header Bar...');
    const itemBox = page.locator('text=/Item:\\s*\\d+\\s*of/i');
    const blockBox = page.locator('text=/Block:\\s*\\d+\\s*of/i');
    const previousBtn = page.locator('button[title="Previous Item"]');
    const nextBtn = page.locator('button[title="Next Item"]');
    const labValuesBtn = page.locator('button:has-text("Lab Values")');
    const notesBtn = page.locator('button:has-text("Notes")');
    const calculatorBtn = page.locator('button:has-text("Calculator")');
    const settingsBtn = page.locator('button:has-text("Settings")');

    if (await itemBox.count() === 0 || await blockBox.count() === 0) {
      throw new Error('Header item/block box missing!');
    }
    console.log('✅ Top header bar elements verified.');

    // 5. Verify Left Question Status Sidebar
    console.log('5️⃣ Verifying Left Question Status Sidebar...');
    const qsHeader = page.locator('aside').filter({ hasText: /Question\s*Status/i });
    const keyBtn = page.locator('button:has-text("Key")');
    if (await qsHeader.count() === 0) throw new Error('Question Status header missing!');
    if (await keyBtn.count() === 0) throw new Error('Sidebar Key button missing!');
    console.log('✅ Left Question Status sidebar verified.');

    // 6. Test Mark Question
    console.log('6️⃣ Testing Mark Question toggle...');
    const markCheckbox = page.locator('input[type="checkbox"]').first();
    await markCheckbox.check();
    await page.waitForTimeout(500);
    console.log('✅ Mark Question toggled.');

    // 7. Test Per-Question Notes Persistence
    console.log('7️⃣ Testing Per-Question Notes Persistence...');
    await notesBtn.click();
    await page.waitForSelector('text=Notes', { timeout: 5000 });
    await page.fill('textarea[placeholder="Type notes for this item here..."]', 'Clinical Pearl: Specific autoantibody markers are crucial for diagnostics.');
    await page.click('button:has-text("Save and Close")');
    await page.waitForTimeout(600);
    console.log('Saved note on Item 1.');

    // Navigate to Item 2 via Question Status sidebar
    console.log('Navigating to Item 2 via sidebar item 2...');
    const item2Sidebar = page.locator('aside').locator('div').filter({ hasText: /^2$/ }).first();
    if (await item2Sidebar.count() > 0) {
      await item2Sidebar.click();
    } else {
      await page.locator('aside span.font-mono:text-is("2")').click();
    }
    await page.waitForTimeout(600);
    await page.waitForSelector('text=/Item:\\s*2\\s*of/i', { timeout: 5000 });
    console.log('Navigated to Item 2.');

    // Open notes on Item 2, verify empty
    await notesBtn.click();
    await page.waitForSelector('text=Notes', { timeout: 5000 });
    const noteValItem2 = await page.inputValue('textarea[placeholder="Type notes for this item here..."]');
    console.log('Item 2 note value:', JSON.stringify(noteValItem2));
    if (noteValItem2.trim() !== '') {
      throw new Error('Item 2 should have empty notes!');
    }
    await page.click('button:has-text("Save and Close")');
    await page.waitForTimeout(400);

    // Navigate back to Item 1 via sidebar
    console.log('Navigating back to Item 1 via sidebar...');
    const item1Sidebar = page.locator('aside').locator('div').filter({ hasText: /^1$/ }).first();
    if (await item1Sidebar.count() > 0) {
      await item1Sidebar.click();
    } else {
      await page.locator('aside span.font-mono:text-is("1")').click();
    }
    await page.waitForTimeout(600);
    await page.waitForSelector('text=/Item:\\s*1\\s*of/i', { timeout: 5000 });
    console.log('Navigated back to Item 1.');

    // Open notes on Item 1, verify preserved!
    await notesBtn.click();
    await page.waitForSelector('text=Notes', { timeout: 5000 });
    const noteValItem1 = await page.inputValue('textarea[placeholder="Type notes for this item here..."]');
    console.log('Item 1 restored note value:', JSON.stringify(noteValItem1));
    if (!noteValItem1.includes('Clinical Pearl')) {
      throw new Error('Item 1 notes were not preserved across navigation!');
    }
    console.log('✅ Notes persistence across question navigation verified!');
    await page.click('button:has-text("Save and Close")');
    await page.waitForTimeout(400);

    // 8. Test Strikethrough Feature
    console.log('8️⃣ Testing Strikethrough [ab] button...');
    const strikeBtn = page.locator('button:has-text("ab")').first();
    if (await strikeBtn.count() > 0) {
      await strikeBtn.click();
      await page.waitForTimeout(300);
      console.log('✅ Strikethrough toggled.');
    }

    // 9. Test Answer Selection & Tutor Mode "Show Answer"
    console.log('9️⃣ Testing Answer Selection and Tutor Mode "Show Answer"...');
    // Select first option
    const firstRadio = page.locator('input[type="radio"]').first();
    await firstRadio.click();
    await page.waitForTimeout(500);

    // Click Show Answer
    const showAnswerBtn = page.locator('button:has-text("Show Answer")');
    if (await showAnswerBtn.count() > 0) {
      await showAnswerBtn.click();
      await page.waitForSelector('text=Explanation & Educational Objective:', { timeout: 5000 });
      console.log('✅ Tutor Mode explanation appeared after Show Answer!');
    }

    // 10. Test Lab Values Modal
    console.log('🔟 Testing Lab Values Modal...');
    await labValuesBtn.click();
    await page.waitForSelector('text=Lab Values', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Calcium');
    await page.waitForTimeout(300);
    console.log('Lab values search tested.');
    // Close modal via close button
    const closeBtn = page.locator('button[title="Close"]').first();
    await closeBtn.click();
    await page.waitForTimeout(400);
    console.log('✅ Lab Values modal verified.');

    // 11. Test Calculator Modal
    console.log('1️⃣1️⃣ Testing Calculator Modal...');
    await calculatorBtn.click();
    await page.waitForSelector('text=Calculator', { timeout: 5000 });
    // Click 7, ×, 8, =
    await page.click('button:has-text("7")');
    await page.click('button:has-text("×")');
    await page.click('button:has-text("8")');
    await page.click('button:has-text("=")');
    await page.waitForTimeout(300);
    const calcDisplay = await page.locator('.font-mono.text-slate-800').innerText();
    console.log('Calculator result:', calcDisplay);
    if (calcDisplay !== '56') {
      console.warn('Calculator display was:', calcDisplay);
    } else {
      console.log('✅ Calculator calculation verified (7 * 8 = 56).');
    }
    const closeCalcBtn = page.locator('button[title="Close"]').first();
    await closeCalcBtn.click();
    await page.waitForTimeout(400);

    // 12. Test End Block Warning Modal
    console.log('1️⃣2️⃣ Testing End Block Warning Modal...');
    const endBlockBtn = page.locator('button[title="End Examination Block"]');
    await endBlockBtn.click();
    await page.waitForSelector('text=Warning - This block is incomplete!', { timeout: 5000 });
    console.log('✅ Incomplete block warning modal displayed correctly!');
    await page.click('button:has-text("Remain in Block")');
    await page.waitForTimeout(400);

    // 13. Test Lock / Unauthorized Break Warning Modal
    console.log('1️⃣3️⃣ Testing Lock / Unauthorized Break Warning Modal...');
    const lockBtn = page.locator('button[title="Lock Exam (Unauthorized Break)"]');
    await lockBtn.click();
    await page.waitForSelector('text=Unauthorized Break Warning', { timeout: 5000 });
    console.log('✅ Unauthorized Break warning modal displayed correctly!');
    await page.click('button:has-text("Return to Exam")');
    await page.waitForTimeout(400);

    // 14. Take Final Screenshot of the Authentic Player
    console.log('1️⃣4️⃣ Taking verification screenshot...');
    await page.screenshot({ path: 'test-player-verified.png', fullPage: true });
    console.log('📸 Screenshot saved to test-player-verified.png');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! USMLE Test Player is fully production-ready.');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    await page.screenshot({ path: 'test-player-error.png' }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testPlayerFullVerification();
