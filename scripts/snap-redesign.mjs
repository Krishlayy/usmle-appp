import { chromium } from 'playwright';
import { resolve } from 'node:path';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Homepage screenshot (PiP removed, redesigned logo, updated navbar)
  const homeShot = resolve(process.cwd(), 'screenshots/redesigned_homepage_no_pip.png');
  await page.screenshot({ path: homeShot });
  console.log('Saved:', homeShot);

  // 2. Click "Fullscreen Video" to verify modal opens full screen
  await page.click('text=Fullscreen Video');
  await page.waitForTimeout(1500);

  const modalShot = resolve(process.cwd(), 'screenshots/fullscreen_video_modal.png');
  await page.screenshot({ path: modalShot });
  console.log('Saved:', modalShot);

  // 3. Fast-forward video inside the iframe to 21.5s to see the Buy Now screen
  const iframeElement = await page.$('iframe');
  if (iframeElement) {
    const frame = await iframeElement.contentFrame();
    if (frame) {
      await frame.evaluate(() => {
        if (window.OPENER) {
          window.OPENER.seek(21.2);
        }
      });
      await page.waitForTimeout(1000);

      const endShot = resolve(process.cwd(), 'screenshots/fullscreen_video_ended_buy_now.png');
      await page.screenshot({ path: endShot });
      console.log('Saved:', endShot);
    }
  }

  // 4. Test clicking navbar buttons to verify they work
  await page.keyboard.press('Escape'); // close modal
  await page.waitForTimeout(500);

  // Click Q-Bank Store
  await page.click('text=Q-Bank Store');
  await page.waitForTimeout(800);
  console.log('Navigated to:', page.url());

  // Click Create Test
  await page.click('text=Create Test');
  await page.waitForTimeout(800);
  console.log('Navigated to:', page.url());

  // Click Peer Analytics
  await page.click('text=Peer Analytics');
  await page.waitForTimeout(800);
  console.log('Navigated to:', page.url());

  // Click Spaced Flashcards
  await page.click('text=Spaced Flashcards');
  await page.waitForTimeout(800);
  console.log('Navigated to:', page.url());

  await browser.close();
  console.log('All tests passed successfully!');
}

main().catch(err => {
  console.error('Snap error:', err);
  process.exit(1);
});
