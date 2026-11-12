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
  console.log('Logged in. Navigating to /attendance...');

  await page.goto('https://localhost:5173/attendance', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const artifactDir = path.resolve(process.env.USERPROFILE || 'C:\\Users\\bapan', '.gemini/antigravity/brain/e6536ba4-2fa4-4990-a8eb-da832f07ec3b');

  // 1. Click Worksites tab
  console.log('Clicking Worksites tab...');
  const worksitesTab = page.locator('button:has-text("Worksites")');
  await worksitesTab.click();
  await page.waitForTimeout(1000);

  const worksitePath = path.join(artifactDir, 'screenshots', 'worksites_tab_actions.png');
  await page.screenshot({ path: worksitePath });
  console.log('Saved worksites screenshot to:', worksitePath);

  // 2. Click Edit Worksite button (first edit button in Worksites table)
  console.log('Clicking Edit Worksite button...');
  const editBtn = page.locator('button[title="Edit Worksite"]').first();
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(800);
    const editModalPath = path.join(artifactDir, 'screenshots', 'edit_worksite_modal.png');
    await page.screenshot({ path: editModalPath });
    console.log('Saved edit modal screenshot to:', editModalPath);

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // 3. Click Biometric Fleet tab
  console.log('Clicking Biometric Fleet tab...');
  const biometricTab = page.locator('button:has-text("Biometric Fleet")');
  await biometricTab.click();
  await page.waitForTimeout(1000);

  const biometricPath = path.join(artifactDir, 'screenshots', 'biometric_fleet_guide.png');
  await page.screenshot({ path: biometricPath });
  console.log('Saved biometric fleet screenshot to:', biometricPath);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});

