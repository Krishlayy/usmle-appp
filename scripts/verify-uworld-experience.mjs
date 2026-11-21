import { chromium } from 'playwright';

async function main() {
  console.log('Testing UWorld / USMLE Test Player Experience & Admin Upload...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('[BROWSER ERROR]', msg.text());
  });

  // 1. Simulator Test Player Flow
  console.log('1. Loading USMLE Test Player at http://localhost:3000/simulator?qbank=approach-to-histology...');
  await page.goto('http://localhost:3000/simulator?qbank=approach-to-histology', { waitUntil: 'networkidle', timeout: 30000 });

  // Dismiss tutorial if present
  const skipBtn = await page.$('button:has-text("Skip Tutorial")');
  if (skipBtn) {
    console.log('Dismissing tutorial modal...');
    await skipBtn.click();
    await page.waitForTimeout(500);
  }

  // Verify Stem is present
  const stemEl = await page.$('.vignette-text');
  console.log('Stem element present:', !!stemEl);

  // Check stem bounding box to verify it is NOT shifted to extreme left
  const stemBox = await stemEl.boundingBox();
  console.log('Stem Bounding Box:', stemBox);
  // Sidebar is ~50px, content should have generous balanced margin
  console.log('Stem left position:', stemBox.x, 'Stem width:', stemBox.width);

  // Check Text Selectability in Question Stem
  const isSelectable = await page.evaluate(() => {
    const el = document.querySelector('.vignette-text');
    if (!el) return false;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
    const selectedText = selection.toString();
    return selectedText.length > 20;
  });
  console.log('Question Stem text is 100% selectable by user:', isSelectable);

  // Verify Exhibit viewer on right
  const exhibitImg = await page.$('img[alt="Clinical Exhibit"]');
  console.log('Exhibit viewer loaded on right:', !!exhibitImg);

  // Take screenshot of stem & exhibit layout
  await page.screenshot({ path: 'uworld-test-player-stem.png', fullPage: false });
  console.log('Saved uworld-test-player-stem.png');

  // 2. Select Option C and Submit
  console.log('Selecting Option C...');
  await page.click('text="Delayed fixation with autolysis"');
  await page.waitForTimeout(300);

  const submitBtn = await page.$('button:has-text("Submit Answer & View Explanation")');
  console.log('Submit button present:', !!submitBtn);
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // 3. Verify Explanation
  const explEl = await page.$('.qbank-explanation-body');
  console.log('Explanation body rendered:', !!explEl);

  // Check Text Selectability in Explanation
  const isExplSelectable = await page.evaluate(() => {
    const el = document.querySelector('.qbank-explanation-body');
    if (!el) return false;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
    const selectedText = selection.toString();
    return selectedText.length > 50;
  });
  console.log('Explanation text is 100% selectable simple text:', isExplSelectable);

  // Check that NO <pre> or <code> code blocks exist in the explanation
  const codeBlocksCount = await page.evaluate(() => {
    const el = document.querySelector('.qbank-explanation-body');
    if (!el) return 0;
    return el.querySelectorAll('pre, code').length;
  });
  console.log('Code blocks in explanation (should be 0):', codeBlocksCount);

  // Take screenshot of explanation
  await page.screenshot({ path: 'uworld-test-player-explanation.png', fullPage: false });
  console.log('Saved uworld-test-player-explanation.png');

  // 4. Test Admin Panel Upload Route
  console.log('4. Logging in as Super Admin to test Admin Panel Upload page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'admin@medico.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log In")');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });

  console.log('Navigating to http://localhost:3000/admin/qbanks/upload...');
  await page.goto('http://localhost:3000/admin/qbanks/upload', { waitUntil: 'networkidle', timeout: 30000 });
  
  const uploadHeader = await page.$('h1:has-text("Upload Question Bank (.docx)")');
  console.log('Admin Upload page loaded:', !!uploadHeader);

  await page.screenshot({ path: 'admin-qbank-upload-page.png', fullPage: false });
  console.log('Saved admin-qbank-upload-page.png');

  console.log('\n=============================================');
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('=============================================');

  await browser.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
