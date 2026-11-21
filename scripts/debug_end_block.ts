import { chromium } from 'playwright';

async function testEndBlock() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/simulator?qbank=autoimmune-diseases');
  
  const skip = page.locator('button:has-text("Skip Tutorial")');
  if (await skip.isVisible().catch(() => false)) await skip.click();

  // Switch to MQB theme
  const settingsBtn = page.locator('button[title*="Settings"], button:has-text("Settings")').first();
  await settingsBtn.click();
  await page.waitForTimeout(500);
  await page.locator('button:has-text("MQB Signature")').click();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Click End Block
  console.log('Clicking End Block button in header...');
  const endBlockBtn = page.locator('header button:has-text("End Block")');
  await endBlockBtn.click();
  await page.waitForTimeout(1000);

  // Print all modal text or buttons
  const modalText = await page.evaluate(() => {
    const modals = document.querySelectorAll('div.fixed');
    return Array.from(modals).map(m => m.innerHTML);
  });
  console.log('Fixed overlay count:', modalText.length);
  console.log('Buttons on page:', await page.locator('button').allTextContents());

  await browser.close();
}

testEndBlock().catch(console.error);
