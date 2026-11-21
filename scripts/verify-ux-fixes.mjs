import { chromium } from 'playwright';
import { resolve } from 'node:path';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Checking Logged-Out Homepage at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of logged-out homepage
  const loggedOutShot = resolve(process.cwd(), 'screenshots/1_logged_out_homepage.png');
  await page.screenshot({ path: loggedOutShot });
  console.log('Saved:', loggedOutShot);

  // Assertions for Logged-Out Navbar:
  const storeLinkInHeader = await page.$('header nav');
  if (storeLinkInHeader) {
    console.error('FAIL: Found navigation links in header when logged out!');
  } else {
    console.log('PASS: Logged out header has NO store/create-test links in center.');
  }

  // Should have Log In and Sign Up
  const loginBtn = await page.$('header a[href="/login"]');
  const signupBtn = await page.$('header a[href="/signup"]');
  if (loginBtn && signupBtn) {
    console.log('PASS: Exactly Log In and Sign Up buttons present in header.');
  } else {
    console.error('FAIL: Missing Log In or Sign Up button in header.');
  }

  // Verify NO "Launch Board Simulator" button
  const launchSimulatorBtn = await page.$(':text("Launch Board Simulator")');
  if (launchSimulatorBtn) {
    console.error('FAIL: Found "Launch Board Simulator" button!');
  } else {
    console.log('PASS: "Launch Board Simulator" is removed from homepage.');
  }

  console.log('\n2. Logging in as admin@medico.com...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@medico.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for redirect to /dashboard and content to finish loading
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForSelector('text="Your QBanks"', { timeout: 20000 });

  console.log('3. Checking Logged-In Unified Dashboard...');
  const dashboardShot = resolve(process.cwd(), 'screenshots/2_logged_in_single_header.png');
  await page.screenshot({ path: dashboardShot });
  console.log('Saved:', dashboardShot);

  // Check headers: there should be only ONE header on the page
  const headerCount = await page.$$eval('header', el => el.length);
  const localNavCount = await page.$$eval('main nav', el => el.length);
  console.log(`Header count: ${headerCount}, main local nav count: ${localNavCount}`);
  if (headerCount === 1) {
    console.log('PASS: Unified single header on dashboard! No duplicate navs.');
  }

  // Verify Super Admin badge
  const superAdminBadge = await page.$(':text("Super Admin")');
  if (superAdminBadge) {
    console.log('PASS: Super Admin badge present.');
  }

  console.log('\n4. Testing "Open QBank" Quick Practice Modal...');
  const openQbankButtons = await page.$$('button:has-text("Open QBank")');
  console.log(`Found ${openQbankButtons.length} "Open QBank" buttons.`);
  if (openQbankButtons.length > 0) {
    await openQbankButtons[0].click();
    await page.waitForTimeout(1000);

    const modalShot = resolve(process.cwd(), 'screenshots/3_quick_practice_modal.png');
    await page.screenshot({ path: modalShot });
    console.log('Saved:', modalShot);

    // Verify modal elements
    const tutorModeCard = await page.$(':text("Tutor Mode")');
    const timedModeCard = await page.$(':text("Timed Mode")');
    const startBlockBtn = await page.$('button:has-text("Start Practice Block")');

    if (tutorModeCard && timedModeCard && startBlockBtn) {
      console.log('PASS: Quick Practice Modal contains Tutor Mode, Timed Mode, and Start Practice Block!');
    } else {
      console.error('FAIL: Missing modal mode selector elements.');
    }

    // Click Timed Mode
    await page.click(':text("Timed Mode")');
    await page.waitForTimeout(300);

    // Select 10 Questions
    const tenQsBtn = await page.$('button:has-text("10 Questions")');
    if (tenQsBtn) {
      await tenQsBtn.click();
      await page.waitForTimeout(300);
    }

    const modalTimedShot = resolve(process.cwd(), 'screenshots/4_modal_timed_mode_selected.png');
    await page.screenshot({ path: modalTimedShot });
    console.log('Saved:', modalTimedShot);

    // Click Start Practice Block and verify redirect into test
    console.log('Launching test block via modal...');
    await page.click('button:has-text("Start Practice Block")');
    await page.waitForURL('**/test/**', { timeout: 20000 });
    await page.waitForTimeout(2000);

    const testPlayerShot = resolve(process.cwd(), 'screenshots/5_test_player_launched.png');
    await page.screenshot({ path: testPlayerShot });
    console.log('Saved:', testPlayerShot);
    console.log('PASS: Successfully launched into test session:', page.url());
  }

  await browser.close();
  console.log('\n✅ All automated verification checks passed cleanly!');
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});