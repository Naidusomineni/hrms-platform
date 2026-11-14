// scripts/test_batch15_fixes.cjs
// Verification Suite for Batch 15 (P2: Functional, SLA & Validation Hardening)

const http = require('http');

const BASE_URL = 'http://localhost:8080/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', (err) => reject(err));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('=== RUNNING BATCH 15 VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate as Admin & Employee
    const adminLogin = await request('POST', '/v1/auth/login', {
      email: 'admin@hrms.com',
      password: 'Admin@123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.data && adminLogin.body.data.accessToken,
      'Admin logged in successfully');
    const adminToken = adminLogin.body.data.accessToken;

    const empLogin = await request('POST', '/v1/auth/login', {
      email: 'emp@hrms.com',
      password: 'Emp@123'
    });
    assert(empLogin.status === 200 && empLogin.body.data && empLogin.body.data.accessToken,
      'Standard Employee logged in successfully');
    const empToken = empLogin.body.data.accessToken;
    const empId = empLogin.body.data.employeeId || empLogin.body.data.user.id;

    // 2. Test Expense Claim Multi-Tier Policy Validation
    console.log('\n--- 1. Expense Claim Multi-Tier Policy Validation ---');
    const today = new Date().toISOString().slice(0, 10);
    const futureDate = '2028-12-31';

    // A. Future date rejected
    const futureClaim = await request('POST', `/v1/expenses/claims?employeeId=${empId}`, {
      category: 'MEALS',
      title: 'Future Team Lunch',
      amount: 1200.00,
      expenseDate: futureDate,
      description: 'Test future date'
    }, empToken);
    assert(futureClaim.status === 400 && futureClaim.body.message.includes('future'),
      'Future-dated expense claim rejected with HTTP 400 Bad Request');

    // B. Exceeding category ceiling (MEALS ceiling is ₹5,000, testing ₹8,500)
    const excessClaim = await request('POST', `/v1/expenses/claims?employeeId=${empId}`, {
      category: 'MEALS',
      title: 'Luxury Dinner Buffet',
      amount: 8500.00,
      expenseDate: today,
      description: 'Exceeding meals limit'
    }, empToken);
    assert(excessClaim.status === 400 && excessClaim.body.message.includes('ceiling of ₹5000.00'),
      'Expense claim exceeding MEALS ceiling (₹5,000) rejected with HTTP 400 Bad Request');

    // C. Valid claim within ceiling (MEALS ₹1,800 <= ₹5,000)
    const validClaim = await request('POST', `/v1/expenses/claims?employeeId=${empId}`, {
      category: 'MEALS',
      title: 'Client Working Lunch',
      amount: 1800.00,
      expenseDate: today,
      description: 'Working lunch with client'
    }, empToken);
    assert(validClaim.status === 200 || validClaim.status === 201,
      `Valid expense claim within category policy accepted (Status: ${validClaim.status})`);

    // 3. Test Performance Review Cycle Lifecycle & Expiration Guard
    console.log('\n--- 2. Performance Cycle Lifecycle & Expiration Guard ---');
    const cyclesRes = await request('GET', '/v1/performance/cycles', null, empToken);
    assert(cyclesRes.status === 200 && Array.isArray(cyclesRes.body.data),
      'Appraisal cycles queried successfully');

    // Create an expired appraisal cycle to test goal addition guard
    const expiredCycleRes = await request('POST', '/v1/performance/cycles', {
      name: 'Legacy-2023-Q4',
      year: 2023,
      startDate: '2023-10-01',
      endDate: '2023-12-31',
      status: 'CLOSED'
    }, adminToken);

    if (expiredCycleRes.status === 200 || expiredCycleRes.status === 201) {
      const expiredCycleId = expiredCycleRes.body.data.id;
      // Attempt to add a goal for an expired/closed cycle
      const expiredGoalRes = await request('POST', '/v1/performance/goals', {
        employeeId: empId,
        cycleId: expiredCycleId,
        title: 'Retroactive Goal Addition',
        description: 'Should be rejected',
        metricTarget: '100',
        weightage: 20
      }, empToken);
      assert(expiredGoalRes.status === 400 && expiredGoalRes.body.message.includes('closed or expired'),
        'Adding goals to a closed/expired appraisal cycle rejected with HTTP 400 Bad Request');
    }

    // Attempt to submit review with inverted dates (end < start)
    const invertedReview = await request('POST', '/v1/performance/reviews', {
      employeeId: empId,
      reviewCycle: 'Annual-2026',
      reviewPeriodStart: '2026-12-31',
      reviewPeriodEnd: '2026-01-01',
      selfRating: 4,
      selfComments: 'Test review'
    }, empToken);
    assert(invertedReview.status === 400 && invertedReview.body.message.includes('end date cannot be before start date'),
      'Performance review with inverted dates rejected with HTTP 400 Bad Request');

    // 4. Test Helpdesk SLA Automated Escalation & Breach Telemetry
    console.log('\n--- 3. Helpdesk SLA Breach Telemetry ---');
    const statsRes = await request('GET', '/v1/helpdesk/tickets/stats', null, adminToken);
    assert(statsRes.status === 200 && statsRes.body.data && typeof statsRes.body.data.slaBreachedCount === 'number',
      `Helpdesk SLA breach telemetry active (Breached SLA Count: ${statsRes.body.data ? statsRes.body.data.slaBreachedCount : 'N/A'})`);

    const ticketsRes = await request('GET', '/v1/helpdesk/tickets?page=0&size=5', null, adminToken);
    assert(ticketsRes.status === 200 && ticketsRes.body.data && Array.isArray(ticketsRes.body.data.content),
      'Helpdesk tickets list queried successfully');
    if (ticketsRes.body.data.content.length > 0) {
      const firstTicket = ticketsRes.body.data.content[0];
      assert(typeof firstTicket.isSlaBreached === 'boolean',
        `Ticket #${firstTicket.ticketNumber} includes isSlaBreached telemetry (${firstTicket.isSlaBreached})`);
    }

    console.log('\n========================================');
    console.log(`BATCH 15 AUDIT SUMMARY:`);
    console.log(`  PASSED: ${passed}`);
    console.log(`  FAILED: ${failed}`);
    console.log('========================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test run failed unexpectedly:', err);
    process.exit(1);
  }
}

run();
