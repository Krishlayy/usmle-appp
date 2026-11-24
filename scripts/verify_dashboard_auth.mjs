import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

async function main() {
  const outDir = resolve(process.cwd(), 'screenshots/verification');
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1080 }
  });

  console.log('Navigating to login http://localhost:3000/login ...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'admin@medico.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  console.log('Waiting for URL to reach /dashboard ...');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  console.log('Waiting for full dashboard content to finish loading...');
  await page.waitForSelector('text="Questions Solved"', { timeout: 30000 });
  await page.waitForTimeout(2500);

  const dashHeroPath = `${outDir}/verified_dashboard_hero.png`;
  await page.screenshot({ path: dashHeroPath });
  console.log('Saved dashboard hero screenshot:', dashHeroPath);

  // Scroll to #qbanks
  await page.evaluate(() => {
    const el = document.getElementById('qbanks');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);

  const dashQbanksPath = `${outDir}/verified_dashboard_qbanks.png`;
  await page.screenshot({ path: dashQbanksPath });
  console.log('Saved dashboard qbanks screenshot:', dashQbanksPath);

  await browser.close();
  console.log('Authenticated dashboard verification complete!');
}

main().catch(err => {
  console.error('Dashboard verification error:', err);
  process.exit(1);
});
