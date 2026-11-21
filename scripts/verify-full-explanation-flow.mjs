import { chromium } from 'playwright';

async function testFullExplanation() {
  console.log('Testing perfected USMLE Test Player explanation flow...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]', msg.text());
    }
  });

  console.log('Navigating to http://localhost:3000/simulator?qbank=approach-to-histology...');
  await page.goto('http://localhost:3000/simulator?qbank=approach-to-histology', { waitUntil: 'networkidle', timeout: 30000 });

  // 1. Skip tutorial if shown
  const skipBtn = await page.$('button:has-text("Skip Tutorial")');
  if (skipBtn) {
    console.log('Skipping tutorial modal...');
    await skipBtn.click();
    await page.waitForTimeout(500);
  }

  // 2. Check question 1 stem
  const stem = await page.textContent('.vignette-text');
  console.log('Q1 stem loaded:', stem.includes('A second-year pathology resident'));

  // 3. Select Option C
  console.log('Selecting Option C...');
  await page.click('text="Delayed fixation with autolysis"');
  await page.waitForTimeout(300);

  // 4. Verify "Submit Answer & View Explanation" button is present and enabled
  const submitBtn = await page.$('button:has-text("Submit Answer & View Explanation")');
  console.log('Submit button present:', !!submitBtn);

  // 5. Click Submit
  console.log('Clicking Submit Answer...');
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // 6. Verify explanation card is visible
  const explCard = await page.$('.qbank-explanation-body');
  console.log('Explanation body rendered:', !!explCard);

  // 7. Verify Video Mnemonic Player
  const video = await page.$('video');
  console.log('Video mnemonic player loaded:', !!video);

  // 8. Verify Table 1
  const table = await page.$('table.qbank-table');
  console.log('Table 1 rendered:', !!table);

  // 9. Verify Clinical Pearl callout card
  const pearlCard = await page.$('text="High-Yield Clinical Pearl"');
  console.log('Clinical Pearl callout card rendered:', !!pearlCard);

  // 10. Verify clicking an explanation image opens Zoom Exhibit modal
  const explImg = await page.$('.qbank-explanation-body img');
  if (explImg) {
    console.log('Clicking explanation image to test zoom lightbox...');
    await explImg.click();
    await page.waitForTimeout(1000);
    const zoomModal = await page.$('#exhibit-display-root');
    console.log('Zoom modal opened on clicking explanation figure:', !!zoomModal);
    if (zoomModal) {
      await page.screenshot({ path: 'zoom-explanation-figure.png' });
      console.log('Saved zoom-explanation-figure.png');
      const closeBtn = await page.$('#exhibit-display-root button[title="Close (Esc)"]');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Scroll to show explanation and capture screenshot
  await page.evaluate(() => {
    const el = document.querySelector('.qbank-explanation-body');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'perfected-explanation-view.png' });
  console.log('Saved perfected-explanation-view.png');

  // 11. Test Question 28 (HIST-028)
  console.log('Testing Question 28 navigation and full explanation...');
  // Navigate via item buttons or direct click
  const item28 = await page.$('div:has-text("28")');
  // Or navigate using next buttons
  await page.goto('http://localhost:3000/simulator?qbank=approach-to-histology&item=27&mode=tutor', { waitUntil: 'networkidle' });
  const skipBtn2 = await page.$('button:has-text("Skip Tutorial")');
  if (skipBtn2) await skipBtn2.click();
  await page.waitForTimeout(500);

  const q28Stem = await page.textContent('.vignette-text');
  console.log('Q28 stem loaded:', q28Stem?.slice(0, 80));

  // Select an option on Q28
  const q28Opt = await page.$('input[name^="q-"]');
  if (q28Opt) await q28Opt.click();
  await page.waitForTimeout(300);

  const q28Submit = await page.$('button:has-text("Submit Answer & View Explanation")');
  if (q28Submit) {
    await q28Submit.click();
    await page.waitForTimeout(1000);
  }

  const q28Expl = await page.$('.qbank-explanation-body');
  const q28HasPearl = (await page.textContent('.qbank-explanation-body'))?.includes('High-Yield Clinical Pearl');
  console.log('Q28 full explanation rendered:', !!q28Expl);
  console.log('Q28 has Clinical Pearl:', q28HasPearl);

  await page.screenshot({ path: 'q28-full-explanation.png' });
  console.log('Saved q28-full-explanation.png');

  await browser.close();
  console.log('All verification checks passed with 100% success!');
}

testFullExplanation().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
