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

  // 1. Capture Policy Hub Module Subscriptions & Features tab
  await page.goto('https://localhost:5173/policies', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('Clicking Module Subscriptions & Features tab...');
  const moduleTab = page.locator('button:has-text("Module Subscriptions & Features")');
  await moduleTab.click();
  await page.waitForTimeout(1000);

  const artifactDir = path.resolve(process.env.USERPROFILE || 'C:\\Users\\bapan', '.gemini/antigravity/brain/e6536ba4-2fa4-4990-a8eb-da832f07ec3b');
  const catalogPath = path.join(artifactDir, 'screenshots', 'module_subscription_catalog.png');
  await page.screenshot({ path: catalogPath, fullPage: false });
  console.log('Saved module subscriptions screenshot to:', catalogPath);

  // 2. Disable RECRUITMENT module temporarily to capture ProtectedRoute disabled screen
  console.log('Toggling RECRUITMENT module off...');
  // Find the toggle button in the Recruitment card
  const recruitmentCard = page.locator('div:has-text("Recruitment & ATS")').locator('button[title*="Module"]').first();
  if (await recruitmentCard.count() > 0) {
    await recruitmentCard.click();
    await page.waitForTimeout(1000);
  }

  // 3. Navigate to /recruitment directly to verify route guard
  console.log('Navigating to /recruitment while module is disabled...');
  await page.goto('https://localhost:5173/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const blockedPath = path.join(artifactDir, 'screenshots', 'module_route_blocked_screen.png');
  await page.screenshot({ path: blockedPath });
  console.log('Saved route blocked screenshot to:', blockedPath);

  // 4. Clean up: Re-enable RECRUITMENT
  await page.goto('https://localhost:5173/policies', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Module Subscriptions & Features")').click();
  await page.waitForTimeout(800);
  const reEnableBtn = page.locator('div:has-text("Recruitment & ATS")').locator('button[title*="Module"]').first();
  if (await reEnableBtn.count() > 0) {
    await reEnableBtn.click();
    await page.waitForTimeout(800);
  }
  console.log('Cleaned up and re-enabled RECRUITMENT.');

  await browser.close();
  console.log('Module flow screenshots completed successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});

