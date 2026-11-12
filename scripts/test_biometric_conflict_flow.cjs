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
  console.log('=== TEST: BIOMETRIC HARDWARE SYNC & WEB LOGIN CONFLICT RESOLUTION ===');
  
  // 1. Auth
  const loginRes = await request('/v1/auth/login', 'POST', {
    email: 'admin@hrms.com',
    password: 'Admin@123'
  });
  const token = loginRes.body.data.accessToken;
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  console.log('✓ Admin authenticated');

  // 2. Fetch biometric devices
  const devRes = await request('/v1/attendance/biometric-devices', 'GET', null, authHeaders);
  console.log(`✓ Biometric fleet online (${devRes.body.data.length} devices):`, devRes.body.data.map(d => `${d.deviceCode} (${d.deviceName})`));

  // 3. Test Device Registration & Deletion
  console.log('\n--- Test Biometric Device CRUD (Register & Delete) ---');
  const newDevRes = await request('/v1/attendance/biometric-devices', 'POST', {
    deviceCode: 'TEST-GATE-TEMP',
    deviceName: 'Temporary Turnstile Test',
    location: 'Warehouse Gate',
    ipAddress: '192.168.1.99',
    isActive: true
  }, authHeaders);
  const tempDeviceId = newDevRes.body.data.id;
  console.log('✓ Successfully registered temporary biometric device ID:', tempDeviceId);

  const deleteDevRes = await request(`/v1/attendance/biometric-devices/${tempDeviceId}`, 'DELETE', null, authHeaders);
  if (deleteDevRes.status !== 200) throw new Error('Failed to delete biometric device');
  console.log('✓ Successfully deleted temporary biometric device via DELETE API');

  // 4. Multi-Perspective Collision Test:
  // Employee scans at Turnstile at 09:05 AM
  console.log('\n--- Scenario: Turnstile Hardware Punch at 09:05 AM ---');
  const todayDate = '2026-11-12'; // Test next day date to have a clean isolate record
  const punchRes = await request('/v1/attendance/biometric-sync', 'POST', [{
    employeeNumber: 'EMP001',
    deviceId: 'GATE-01',
    timestamp: `${todayDate}T09:05:00`
  }], authHeaders);
  console.log('✓ Biometric sync result:', punchRes.body.data);

  // Verify attendance record
  const checkRes = await request(`/v1/attendance/date?date=${todayDate}`, 'GET', null, authHeaders);
  const empRecord = checkRes.body.data.find(r => r.employeeNumber === 'EMP001');
  console.log('Record after Turnstile Punch:', {
    checkInTime: empRecord.checkInTime,
    status: empRecord.status,
    punchSource: empRecord.punchSource,
    deviceId: empRecord.deviceId
  });
  if (empRecord.checkInTime !== '09:05:00') throw new Error('Check-In time was not 09:05:00!');
  if (empRecord.status !== 'PRESENT') throw new Error('Status should be PRESENT!');

  // 5. Subsequent Inner Gate punch at 09:12 AM (within 30 mins)
  console.log('\n--- Inner Gate Punch at 09:12 AM (Duplicate scan within 30 mins) ---');
  await request('/v1/attendance/biometric-sync', 'POST', [{
    employeeNumber: 'EMP001',
    deviceId: 'GATE-02',
    timestamp: `${todayDate}T09:12:00`
  }], authHeaders);

  const check2 = await request(`/v1/attendance/date?date=${todayDate}`, 'GET', null, authHeaders);
  const empRecord2 = check2.body.data.find(r => r.employeeNumber === 'EMP001');
  console.log('Record after Inner Gate scan:', {
    checkInTime: empRecord2.checkInTime,
    checkOutTime: empRecord2.checkOutTime
  });
  if (empRecord2.checkInTime !== '09:05:00') throw new Error('CheckInTime corrupted by duplicate scan!');
  if (empRecord2.checkOutTime !== null) throw new Error('CheckOutTime should NOT be set within 30 min buffer!');

  // 6. Evening Turnstile Departure Punch at 18:20:00 (06:20 PM)
  console.log('\n--- Evening Turnstile Punch at 18:20 PM (Building Exit) ---');
  await request('/v1/attendance/biometric-sync', 'POST', [{
    employeeNumber: 'EMP001',
    deviceId: 'GATE-01',
    timestamp: `${todayDate}T18:20:00`
  }], authHeaders);

  const check3 = await request(`/v1/attendance/date?date=${todayDate}`, 'GET', null, authHeaders);
  const empRecord3 = check3.body.data.find(r => r.employeeNumber === 'EMP001');
  console.log('Record after Evening Turnstile Exit:', {
    checkInTime: empRecord3.checkInTime,
    checkOutTime: empRecord3.checkOutTime,
    workingHours: empRecord3.workingHours,
    overtimeHours: empRecord3.overtimeHours,
    status: empRecord3.status
  });
  if (empRecord3.checkInTime !== '09:05:00') throw new Error('CheckInTime altered unexpectedly!');
  if (empRecord3.checkOutTime !== '18:20:00') throw new Error('CheckOutTime was not 18:20:00!');
  console.log(`✓ Total Working Hours computed: ${empRecord3.workingHours} hrs, OT: ${empRecord3.overtimeHours} hrs`);

  console.log('\n======================================================');
  console.log('✅ ALL BIOMETRIC INTEGRATION & CONFLICT TESTS PASSED!');
  console.log('======================================================');
}

run().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});

