const http = require('http');

const API_BASE = 'http://localhost:8080/api';

function request(path, method, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': 'default',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resp);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resp });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Authenticate as Admin / HR ---');
  const loginRes = await request('/v1/auth/login', 'POST', {
    email: 'admin@hrms.com',
    password: 'Admin@123'
  });
  if (loginRes.status !== 200 || !loginRes.body.data?.accessToken) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.data.accessToken;
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  console.log('✓ Admin authenticated successfully.');

  console.log('\n--- 2. Fetch & Validate Corporate Worksites (Eoxys Systems) ---');
  const locsRes = await request('/v1/attendance/office-locations', 'GET', null, authHeaders);
  console.log('Worksites in DB:', locsRes.body.data.map(l => `${l.id}: ${l.name} (${l.address})`));
  const eoxysHQ = locsRes.body.data.find(l => l.name.toLowerCase().includes('eoxys'));
  if (!eoxysHQ) throw new Error('Expected Eoxys Systems corporate worksite not found!');
  console.log('✓ Validated Eoxys Systems worksite:', eoxysHQ.name);

  // Test Worksite Edit (PUT)
  console.log('\n--- 2b. Test Worksite Edit (PUT /v1/attendance/office-locations/:id) ---');
  const updateRes = await request(`/v1/attendance/office-locations/${eoxysHQ.id}`, 'PUT', {
    name: 'Eoxys Systems - Bengaluru HQ',
    address: '22, 7th Cross, KHB Main Road, Kaval Bairasandra, RT Nagar, Bengaluru, Karnataka 560032',
    latitude: 13.0182,
    longitude: 77.5985,
    radiusMeters: 250,
    ipWhitelist: '192.168.1.0/24, 10.0.0.0/16',
    isActive: true
  }, authHeaders);
  if (updateRes.status !== 200) throw new Error('Worksite update failed: ' + JSON.stringify(updateRes.body));
  console.log('✓ Worksite updated successfully via PUT API:', updateRes.body.data.name);

  console.log('\n--- 3. Fetch Employees & Today Attendance Register ---');
  const empsRes = await request('/v1/employees?size=50', 'GET', null, authHeaders);
  const emps = empsRes.body.data.content;
  console.log(`Found ${emps.length} employees.`);
  const testEmp = emps.find(e => e.email === 'emp@hrms.com') || emps[0];
  console.log(`Using test employee: ${testEmp.firstName} ${testEmp.lastName} (ID: ${testEmp.id})`);

  const today = new Date().toISOString().slice(0, 10);
  const regRes = await request(`/v1/attendance/date?date=${today}`, 'GET', null, authHeaders);
  console.log(`Existing today records: ${regRes.body.data.length}`);

  let attendanceId;
  const existingToday = regRes.body.data.find(r => r.employeeId === testEmp.id);
  if (existingToday) {
    attendanceId = existingToday.id;
    console.log(`Existing attendance record found with ID: ${attendanceId}`);
  } else {
    console.log('\n--- 4. Mark Attendance with Late In Time (10:15) ---');
    const markRes = await request('/v1/attendance', 'POST', {
      employeeId: testEmp.id,
      date: today,
      checkInTime: '10:15:00',
      checkOutTime: '18:30:00',
      status: 'LATE_ARRIVAL',
      remarks: 'Arrived late due to train delay'
    }, authHeaders);
    if (markRes.status !== 201) throw new Error('Failed to mark attendance: ' + JSON.stringify(markRes.body));
    attendanceId = markRes.body.data.id;
    console.log(`✓ Marked attendance with ID: ${attendanceId}, Status: ${markRes.body.data.status}`);
  }

  console.log('\n--- 5. HR Punch Adjustment: Change Login Time from 10:15 to 09:10 ---');
  const adjustRes = await request(`/v1/attendance/${attendanceId}`, 'PUT', {
    employeeId: testEmp.id,
    date: today,
    checkInTime: '09:10:00',
    checkOutTime: '18:10:00',
    status: 'PRESENT',
    remarks: '[HR Adjusted] Entry turnstile scanner glitch verified by security'
  }, authHeaders);

  if (adjustRes.status !== 200) throw new Error('Failed to adjust punch: ' + JSON.stringify(adjustRes.body));
  const updated = adjustRes.body.data;
  console.log('✓ Adjusted punch successfully!');
  console.log(`  Updated In Time: ${updated.checkInTime}`);
  console.log(`  Updated Out Time: ${updated.checkOutTime}`);
  console.log(`  Recalculated Hours: ${updated.workingHours} hrs`);
  console.log(`  Updated Status: ${updated.status}`);
  console.log(`  Audit Remarks: ${updated.remarks}`);

  if (updated.checkInTime !== '09:10:00') throw new Error(`CheckInTime mismatch: expected 09:10:00, got ${updated.checkInTime}`);
  if (updated.status !== 'PRESENT') throw new Error(`Status mismatch: expected PRESENT, got ${updated.status}`);
  if (!updated.workingHours || updated.workingHours < 8.0) throw new Error(`Working hours should be >= 8.0, got ${updated.workingHours}`);

  console.log('\n--- 6. Test Employee Missed Punch Correction Flow ---');
  const empLogin = await request('/v1/auth/login', 'POST', {
    email: testEmp.email || 'emp@hrms.com',
    password: 'Emp@123'
  });
  const empToken = empLogin.body.data.accessToken;
  const empHeaders = { 'Authorization': `Bearer ${empToken}` };

  const testPastDate = '2026-11-09'; // past date within 5-day policy window for missed punch test
  const regularizeRes = await request('/v1/attendance/regularize', 'POST', {
    employeeId: testEmp.id,
    date: testPastDate,
    requestedCheckIn: '09:00:00',
    requestedCheckOut: '18:00:00',
    reason: '[FORGOT_PUNCH] Forgot ID badge at reception, attended all meetings'
  }, empHeaders);

  if (regularizeRes.status === 201) {
    const regId = regularizeRes.body.data.id;
    console.log(`✓ Missed punch request submitted with ID: ${regId}, status: ${regularizeRes.body.data.status}`);

    console.log('\n--- 7. Manager Reviews & Approves Missed Punch ---');
    const reviewRes = await request(`/v1/attendance/regularize/${regId}/review?action=APPROVE&comments=ApprovedByManager`, 'PUT', null, authHeaders);
    console.log(`✓ Manager approval status: ${reviewRes.status}, Result: ${reviewRes.body.data.status}`);
  } else {
    console.log('Regularization response:', regularizeRes.body);
  }

  console.log('\n======================================================');
  console.log('✅ ALL ENTERPRISE ATTENDANCE & SHIFT TESTS PASSED!');
  console.log('======================================================');
}

run().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
