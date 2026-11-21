import { chromium } from 'playwright';

async function testHistologyPlayer() {
  console.log('Launching browser to test USMLE Test Player with Approach to Histology...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]', msg.text());
    }
  });

  console.log('Navigating to http://localhost:3000/simulator?mode=tutor...');
  await page.goto('http://localhost:3000/simulator?mode=tutor', { waitUntil: 'networkidle', timeout: 30000 });

  // Dismiss tutorial if visible
  const skipTutBtn = await page.$('button:has-text("Skip Tutorial")');
  if (skipTutBtn) {
    console.log('Skipping tutorial modal...');
    await skipTutBtn.click();
    await page.waitForTimeout(500);
  }

  // 1. Verify item 1 title and question
  const stemText = await page.textContent('.vignette-text');
  console.log('Stem text found:', stemText ? stemText.slice(0, 100) + '...' : 'NONE');

  // 2. Verify exhibit is displayed on the right
  const exhibitImg = await page.$('img[alt="Clinical Exhibit"]');
  console.log('Exhibit image displayed on the right:', !!exhibitImg);
  if (exhibitImg) {
    const src = await exhibitImg.getAttribute('src');
    console.log('Exhibit image src:', src);
  }

  // 3. Click exhibit to test ExhibitDisplay zoom modal
  console.log('Clicking exhibit to test zoom modal...');
  await page.click('button[title="Zoom / Fullscreen Exhibit"]');
  await page.waitForTimeout(1000);

  const modalRoot = await page.$('#exhibit-display-root');
  console.log('Exhibit display modal opened:', !!modalRoot);

  await page.screenshot({ path: 'histology-exhibit-modal.png' });
  console.log('Saved screenshot: histology-exhibit-modal.png');

  // Close modal via close button
  console.log('Closing exhibit modal...');
  const closeBtn = await page.$('#exhibit-display-root button[title="Close (Esc)"]');
  if (closeBtn) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // 4. Test selecting answer option C
  console.log('Selecting option C (Delayed fixation with autolysis)...');
  await page.click('text="Delayed fixation with autolysis"');
  await page.waitForTimeout(500);

  // 5. Test tutor mode "Show Answer" feedback
  const showAnswerBtn = await page.$('button:has-text("Show Answer")');
  if (showAnswerBtn) {
    console.log('Clicking "Show Answer"...');
    await showAnswerBtn.click();
    await page.waitForTimeout(1500);
  }

  // Verify Video Mnemonic player is displayed
  const videoPlayer = await page.$('video');
  console.log('Video element rendered:', !!videoPlayer);
  if (videoPlayer) {
    const videoSrc = await videoPlayer.getAttribute('src');
    console.log('Video element src:', videoSrc);
  }

  // Verify explanation table (Table 1) rendered
  const table1 = await page.$('table.qbank-table');
  console.log('Explanation table rendered:', !!table1);

  await page.screenshot({ path: 'histology-q1-tutor-revealed.png', fullPage: true });
  console.log('Saved screenshot: histology-q1-tutor-revealed.png');

  // 6. Navigate to Q2
  console.log('Navigating to Question 2...');
  await page.click('button[title="Next Item"]');
  await page.waitForTimeout(1000);

  const q2Text = await page.textContent('.vignette-text');
  console.log('Q2 text preview:', q2Text ? q2Text.slice(0, 80) + '...' : 'NONE');

  await browser.close();
  console.log('Verification script completed successfully!');
}

testHistologyPlayer().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
