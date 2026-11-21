import { chromium } from 'playwright';
import { resolve } from 'node:path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const homeScreenshot = resolve(process.cwd(), 'screenshots/website_homepage_with_motion.png');
  await page.screenshot({ path: homeScreenshot, fullPage: false });
  console.log('Home screenshot saved:', homeScreenshot);

  console.log('Navigating to http://localhost:3000/motion...');
  await page.goto('http://localhost:3000/motion', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const motionScreenshot = resolve(process.cwd(), 'screenshots/website_motion_page.png');
  await page.screenshot({ path: motionScreenshot, fullPage: false });
  console.log('Motion page screenshot saved:', motionScreenshot);

  await browser.close();
  console.log('Verification completed!');
}

main().catch(err => {
  console.error('Snap website failed:', err);
  process.exit(1);
});
