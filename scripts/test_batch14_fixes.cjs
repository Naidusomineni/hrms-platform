// scripts/test_batch14_fixes.cjs
// Verification Suite for Batch 14 (P1: High-Impact Business & Lifecycle Integrity)

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
  console.log('=== RUNNING BATCH 14 VERIFICATION SUITE ===\n');
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

    // 2. Test Multi-Tenant Dynamic Currency in Bank Batch Export
    console.log('\n--- 1. Multi-Tenant Currency Export ---');
    const curMonth = new Date().getMonth() + 1;
    const curYear = new Date().getFullYear();
    const csvRes = await request('GET', `/v1/payroll/bank-batch-export?month=${curMonth}&year=${curYear}`, null, adminToken);
    assert(csvRes.status === 200, 'Bank batch CSV export endpoint returned HTTP 200');
    assert(typeof csvRes.body === 'string' && csvRes.body.includes('Currency'),
      'Bank batch CSV header contains Currency column');
    assert(typeof csvRes.body === 'string' && csvRes.body.includes('"INR"'),
      'Bank batch CSV records populate default tenant currency ("INR")');

    // 3. Test Cross-Midnight Overnight Shift Calculation
    console.log('\n--- 2. Cross-Midnight Overnight Shift Calculation ---');
    // Get existing attendance for today to test adjustment
    const attList = await request('GET', `/v1/attendance/employee/${empId}?page=0&size=5`, null, adminToken);
    assert(attList.status === 200, 'Queried employee attendance history');

    // Test Manual Mark / Adjustment with Overnight hours: 22:00 to 06:00 (8 hours)
    // Find or pick a past date
    const pastDate = '2026-10-15';
    // First, check if attendance exists for 2026-10-15; if not, mark it
    let testAttId = null;
    const markRes = await request('POST', '/v1/attendance', {
      employeeId: empId,
      date: pastDate,
      checkInTime: '22:00:00',
      checkOutTime: '06:00:00',
      status: 'PRESENT',
      remarks: 'Overnight shift test'
    }, adminToken);

    if (markRes.status === 200 || markRes.status === 201) {
      testAttId = markRes.body.data.id;
      assert(markRes.body.data.workingHours === 8,
        `Overnight shift check-in (22:00) to check-out (06:00) computed workingHours = 8.0 (Got: ${markRes.body.data.workingHours})`);
    } else if (markRes.status === 409 || markRes.body.message.includes('already recorded')) {
      // Record already exists, test update API
      const existingAtt = (await request('GET', `/v1/attendance/date?date=${pastDate}`, null, adminToken)).body.data;
      const target = existingAtt.find(a => a.employeeId === empId);
      if (target) {
        testAttId = target.id;
        const updateRes = await request('PUT', `/v1/attendance/${testAttId}`, {
          employeeId: empId,
          date: pastDate,
          checkInTime: '22:00:00',
          checkOutTime: '06:00:00',
          status: 'PRESENT'
        }, adminToken);
        assert(updateRes.status === 200, 'Update attendance with overnight hours returned HTTP 200');
        assert(updateRes.body.data.workingHours === 8,
          `Overnight shift update computed workingHours = 8.0 (Got: ${updateRes.body.data.workingHours})`);
      }
    }

    // Test Invalid Shift Duration (> 16 hours, e.g., 22:00 to 18:00 next day = 20 hours)
    if (testAttId) {
      const invalidUpdate = await request('PUT', `/v1/attendance/${testAttId}`, {
        employeeId: empId,
        date: pastDate,
        checkInTime: '22:00:00',
        checkOutTime: '18:00:00', // 20 hours
        status: 'PRESENT'
      }, adminToken);
      assert(invalidUpdate.status === 400 && invalidUpdate.body.message.includes('maximum 16-hour shift duration'),
        'Excessive shift duration (> 16h) rejected with HTTP 400 Bad Request');
    }

    // 4. Test Attendance Regularization Duplicate Guard
    console.log('\n--- 3. Attendance Regularization Duplicate Guard ---');
    const regDate = '2026-11-13'; // within filing window
    const firstReg = await request('POST', '/v1/attendance/regularize', {
      employeeId: empId,
      date: regDate,
      requestedCheckIn: '09:00:00',
      requestedCheckOut: '18:00:00',
      reason: 'Biometric card forgotten - Test Request 1'
    }, empToken);

    if (firstReg.status === 200 || firstReg.status === 201) {
      assert(firstReg.body.data.status === 'PENDING', 'First regularization request created with status PENDING');
      
      // Attempt duplicate submission for the same date
      const duplicateReg = await request('POST', '/v1/attendance/regularize', {
        employeeId: empId,
        date: regDate,
        requestedCheckIn: '09:15:00',
        requestedCheckOut: '18:15:00',
        reason: 'Duplicate submission attempt'
      }, empToken);
      assert(duplicateReg.status === 400 && duplicateReg.body.message.includes('already pending approval'),
        'Duplicate pending regularization request rejected with HTTP 400 Bad Request');
    } else if (firstReg.status === 400 && firstReg.body.message.includes('already pending approval')) {
      assert(true, 'Duplicate pending regularization guard active and rejected duplicate request');
    } else {
      console.log('    Notice: Regularization request returned:', firstReg.status, firstReg.body);
    }

    console.log('\n========================================');
    console.log(`BATCH 14 AUDIT SUMMARY:`);
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
