import { chromium } from 'playwright';

async function scrollMore() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000/simulator?mode=tutor', { waitUntil: 'networkidle' });

  const skip = await page.$('button:has-text("Skip Tutorial")');
  if (skip) await skip.click();
  await page.waitForTimeout(500);

  await page.click('text="Delayed fixation with autolysis"');
  await page.waitForTimeout(500);

  const showBtn = await page.$('button:has-text("Show Answer")');
  if (showBtn) await showBtn.click();
  await page.waitForTimeout(1000);

  // Scroll down to Table 1
  await page.evaluate(() => {
    const table = document.querySelector('table.qbank-table');
    if (table) table.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scroll_table.png' });

  // Scroll down to figures
  await page.evaluate(() => {
    const imgs = document.querySelectorAll('.bg-\\[\\#f8fafc\\] img');
    if (imgs.length > 0) imgs[0].scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scroll_figures.png' });

  await browser.close();
  console.log('Saved scroll_table.png and scroll_figures.png');
}

scrollMore().catch(console.error);
