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

  console.log('Navigating to landing page http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const landingPath = `${outDir}/verified_landing_hero.png`;
  await page.screenshot({ path: landingPath });
  console.log('Saved landing hero screenshot:', landingPath);

  // Scroll down to qbanks
  await page.evaluate(() => {
    const el = document.getElementById('qbanks');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);

  const qbanksPath = `${outDir}/verified_qbanks_section.png`;
  await page.screenshot({ path: qbanksPath });
  console.log('Saved qbanks section screenshot:', qbanksPath);

  await browser.close();
  console.log('Verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
