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
  const outPath = path.join(artifactDir, 'screenshots', 'revamped_attendance_register.png');

  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved screenshot to:', outPath);

  // Click the first "Adjust Punch" button to capture the modal
  const adjustBtn = page.locator('button:has-text("Adjust Punch")').first();
  if (await adjustBtn.count() > 0) {
    await adjustBtn.click();
    await page.waitForTimeout(800);
    const modalPath = path.join(artifactDir, 'screenshots', 'adjust_punch_modal_preview.png');
    await page.screenshot({ path: modalPath });
    console.log('Saved modal screenshot to:', modalPath);
  }

  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
