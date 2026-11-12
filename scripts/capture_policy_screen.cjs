const { chromium } = require('../frontend/node_modules/@playwright/test');
const path = require('path');

async function capture() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--ignore-certificate-errors']
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to login...');
  await page.goto('https://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@hrms.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle' });
  console.log('Logged in. Navigating to /policies...');

  await page.goto('https://localhost:5173/policies', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const artifactDir = path.resolve(process.env.USERPROFILE || 'C:\\Users\\bapan', '.gemini/antigravity/brain/e6536ba4-2fa4-4990-a8eb-da832f07ec3b');
  
  // 1. Capture Main Policies Cards view
  const mainPath = path.join(artifactDir, 'screenshots', 'policy_cards_dynamic_timings.png');
  await page.screenshot({ path: mainPath, fullPage: true });
  console.log('Saved main policies screenshot to:', mainPath);

  // 2. Open "Configure Rules" modal on Tech Flexi (10:00 AM - 07:00 PM)
  const configureBtns = page.locator('button:has-text("Configure Rules")');
  if (await configureBtns.count() > 1) {
    await configureBtns.nth(1).click();
    await page.waitForTimeout(1000);
    const modalPath = path.join(artifactDir, 'screenshots', 'policy_edit_shift_timings_modal.png');
    await page.screenshot({ path: modalPath });
    console.log('Saved edit policy modal screenshot to:', modalPath);

    // Close modal
    await page.locator('button:has-text("Cancel")').click();
    await page.waitForTimeout(500);
  }

  // 3. Switch to "Department & Branch Assignments" and open "Assign Policy to Scope"
  await page.locator('button:has-text("Department & Branch Assignments")').click();
  await page.waitForTimeout(1000);

  const assignBtn = page.locator('button:has-text("Assign Policy to Scope")');
  if (await assignBtn.count() > 0) {
    await assignBtn.click();
    await page.waitForTimeout(1000);
    const assignModalPath = path.join(artifactDir, 'screenshots', 'assign_scope_dropdowns_modal.png');
    await page.screenshot({ path: assignModalPath });
    console.log('Saved assign scope dropdowns modal to:', assignModalPath);
  }

  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});

