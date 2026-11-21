import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

async function main() {
  const outDir = resolve(process.cwd(), 'screenshots/motion');
  await mkdir(outDir, { recursive: true });

  const fileUrl = pathToFileURL(resolve(process.cwd(), 'public/motion/index.html')).href + '?clean=1';
  console.log('Navigating to:', fileUrl);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for OPENER ready
  await page.waitForFunction(() => window.OPENER && window.OPENER.ready);

  const times = [
    { sec: 1.5, name: 'act1_clinical_challenge' },
    { sec: 5.2, name: 'act2_exam_simulator' },
    { sec: 7.2, name: 'act3_distractor_elimination' },
    { sec: 9.8, name: 'act3_diagnostic_correct' },
    { sec: 13.8, name: 'act4_mnemonic_bloom_score' },
    { sec: 17.5, name: 'act5_system_mastery' },
    { sec: 20.8, name: 'act6_brand_resolve' }
  ];

  for (const item of times) {
    await page.evaluate((t) => {
      window.OPENER.seek(t);
    }, item.sec);

    await page.waitForTimeout(100);

    const path = `${outDir}/${item.name}_t${item.sec}.png`;
    await page.screenshot({ path });
    console.log(`Saved screenshot: ${path}`);
  }

  // Also snapshot Loading mode
  await page.evaluate(() => {
    window.setExperienceMode('loading');
  });
  await page.waitForTimeout(1200);
  const loadingPath = `${outDir}/loading_mode_screen.png`;
  await page.screenshot({ path: loadingPath });
  console.log(`Saved screenshot: ${loadingPath}`);

  await browser.close();
  console.log('Visual verification complete!');
}

main().catch(err => {
  console.error('Snapshot failed:', err);
  process.exit(1);
});
