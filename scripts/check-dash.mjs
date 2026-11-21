import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@medico.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  console.log('Waiting for loading screen to finish and dashboard to load...');
  await page.waitForSelector('text="Your QBanks"', { timeout: 20000 });

  const innerText = await page.innerText('body');
  console.log('--- ENTIRE BODY INNERTEXT ---');
  console.log(innerText.slice(0, 1500));
  console.log('-----------------------------');

  const openQbankButtons = await page.$$('button:has-text("Open QBank")');
  console.log(`Found ${openQbankButtons.length} "Open QBank" buttons!`);

  if (openQbankButtons.length > 0) {
    console.log('Clicking "Open QBank"...');
    await openQbankButtons[0].click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'screenshots/quick_practice_modal_verified.png' });
    console.log('Saved screenshot of Quick Practice Modal!');

    const modalText = await page.innerText('body');
    console.log('Modal contains "Select Examination Mode":', modalText.includes('Select Examination Mode'));
    console.log('Modal contains "Tutor Mode":', modalText.includes('Tutor Mode'));
    console.log('Modal contains "Timed Mode":', modalText.includes('Timed Mode'));
  }

  await browser.close();
}

main().catch(console.error);