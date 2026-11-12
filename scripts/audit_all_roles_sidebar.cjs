const { chromium } = require('../frontend/node_modules/@playwright/test');

const ROLES_TO_TEST = [
  {
    roleName: 'System Admin',
    email: 'admin@hrms.com',
    password: 'Admin@123',
    routes: [
      '/dashboard', '/announcements', '/attendance', '/shifts', '/leaves',
      '/approvals', '/requests', '/employees', '/departments', '/documents',
      '/recruitment', '/performance', '/intelligence', '/offboarding',
      '/payroll', '/expenses', '/assets', '/helpdesk', '/reports',
      '/policies', '/admin', '/profile'
    ]
  },
  {
    roleName: 'HR Business Partner',
    email: 'hr@hrms.com',
    password: 'Hr@123',
    routes: [
      '/dashboard', '/announcements', '/attendance', '/shifts', '/leaves',
      '/approvals', '/requests', '/employees', '/departments', '/documents',
      '/recruitment', '/performance', '/intelligence', '/offboarding',
      '/payroll', '/expenses', '/assets', '/helpdesk', '/reports',
      '/policies', '/profile'
    ]
  },
  {
    roleName: 'Engineering Manager',
    email: 'manager@hrms.com',
    password: 'Manager@123',
    routes: [
      '/dashboard', '/announcements', '/attendance', '/shifts', '/leaves',
      '/approvals', '/requests', '/employees', '/documents',
      '/recruitment', '/performance', '/intelligence', '/offboarding',
      '/payroll', '/expenses', '/assets', '/helpdesk', '/reports',
      '/profile'
    ]
  },
  {
    roleName: 'Standard Employee',
    email: 'emp@hrms.com',
    password: 'Emp@123',
    routes: [
      '/dashboard', '/announcements', '/attendance', '/shifts', '/leaves',
      '/requests', '/documents', '/performance', '/intelligence',
      '/offboarding', '/payroll', '/expenses', '/assets', '/helpdesk',
      '/profile'
    ]
  }
];

async function runAudit() {
  console.log('=== STARTING DEEP SIDEBAR & WORKFLOW AUDIT ACROSS ALL ROLES ===\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  const auditReport = [];

  for (const account of ROLES_TO_TEST) {
    console.log(`\n==================================================`);
    console.log(`[TESTING ROLE: ${account.roleName} (${account.email})]`);
    console.log(`==================================================`);

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('ResizeObserver')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('response', res => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        failedRequests.push({ url: res.url(), status: res.status() });
      }
    });

    try {
      // 1. Login
      await page.goto('https://localhost:5173/login', { waitUntil: 'networkidle' });
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });
      console.log(`✅ Logged in successfully as ${account.roleName}`);

      // 2. Iterate through each sidebar route
      for (const route of account.routes) {
        consoleErrors.length = 0;
        failedRequests.length = 0;

        const targetUrl = `https://localhost:5173${route}`;
        try {
          await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(800); // Allow react state to render

          // Check if page showed error crash or 404
          const bodyText = await page.textContent('body');
          const isCrash = bodyText.includes('Something went wrong') || bodyText.includes('Application Error') || bodyText.includes('Uncaught Error');
          const is404 = bodyText.includes('Page Not Found') || bodyText.includes('404');
          const isAccessDenied = bodyText.includes('Access Denied') || bodyText.includes('Forbidden (403)');

          const result = {
            role: account.roleName,
            route,
            success: !isCrash && !is404 && failedRequests.length === 0 && consoleErrors.length === 0,
            isCrash,
            is404,
            isAccessDenied,
            failedRequests: [...failedRequests],
            consoleErrors: [...consoleErrors]
          };

          if (result.success) {
            console.log(`  ✅ ${route.padEnd(20)} [OK]`);
          } else {
            console.log(`  ⚠️  ${route.padEnd(20)} [ISSUES DETECTED]`);
            if (isCrash) console.log(`      - React crash text detected!`);
            if (is404) console.log(`      - 404 Page Not Found detected!`);
            if (failedRequests.length > 0) {
              console.log(`      - Failed API calls (${failedRequests.length}):`, failedRequests.map(r => `${r.status} ${r.url.split('/api')[1] || r.url}`));
            }
            if (consoleErrors.length > 0) {
              console.log(`      - Console errors (${consoleErrors.length}):`, consoleErrors.slice(0, 2));
            }
          }
          auditReport.push(result);
        } catch (navErr) {
          console.log(`  ❌ ${route.padEnd(20)} [NAVIGATION FAILED]: ${navErr.message}`);
          auditReport.push({
            role: account.roleName,
            route,
            success: false,
            isCrash: true,
            navError: navErr.message,
            failedRequests: [...failedRequests],
            consoleErrors: [...consoleErrors]
          });
        }
      }
    } catch (loginErr) {
      console.error(`❌ Login failed for ${account.roleName}:`, loginErr.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log('\n\n=== AUDIT SUMMARY RESULTS ===');
  const total = auditReport.length;
  const passed = auditReport.filter(r => r.success).length;
  const failed = auditReport.filter(r => !r.success);

  console.log(`Total Route Checks: ${total}`);
  console.log(`Passed Cleanly:     ${passed}`);
  console.log(`Issues Found:       ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n--- DETAILED ISSUES REGISTER ---');
    failed.forEach(f => {
      console.log(`[${f.role}] Route: ${f.route}`);
      if (f.failedRequests && f.failedRequests.length > 0) {
        console.log(`   APIs: ${f.failedRequests.map(r => `${r.status} ${r.url.split('/api')[1] || r.url}`).join(', ')}`);
      }
      if (f.consoleErrors && f.consoleErrors.length > 0) {
        console.log(`   Console: ${f.consoleErrors[0]}`);
      }
    });
  }
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
