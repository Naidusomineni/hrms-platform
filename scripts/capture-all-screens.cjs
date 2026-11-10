const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

(async () => {
  const outDir = path.resolve(__dirname, '../docs/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
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
  await page.screenshot({ path: path.join(outDir, '01_login_page.png') });

  console.log('Logging in as Admin...');
  await page.fill('input[type="email"]', 'admin@hrms.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const screens = [
    { url: 'https://localhost:5173/dashboard', file: '02_corporate_dashboard.png', name: 'Dashboard' },
    { url: 'https://localhost:5173/employees', file: '03_employee_directory.png', name: 'Employees' },
    { url: 'https://localhost:5173/attendance', file: '04_biometric_attendance.png', name: 'Attendance' },
    { url: 'https://localhost:5173/payroll', file: '05_payroll_register.png', name: 'Payroll' },
    { url: 'https://localhost:5173/recruitment', file: '06_recruitment_ats.png', name: 'Recruitment & ATS' },
    { url: 'https://localhost:5173/leaves', file: '07_leave_management.png', name: 'Leave Management' },
    { url: 'https://localhost:5173/expenses', file: '08_expense_claims.png', name: 'Expense Claims' },
  ];

  for (const s of screens) {
    console.log(`Capturing ${s.name}...`);
    try {
      await page.goto(s.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outDir, s.file) });
    } catch (e) {
      console.error(`Failed ${s.name}:`, e.message);
    }
  }

  console.log('Finished capturing all screenshots into docs/screenshots');
  await browser.close();
})();
