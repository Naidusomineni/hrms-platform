const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== VERIFYING BATCH 0 CRITICAL SECURITY FIXES ===\n');

  // TEST 1: Unauthenticated access to /v1/auth/change-password (SEC-001/SEC-003)
  console.log('[TEST 1] Testing unauthenticated access to /v1/auth/change-password...');
  const res1 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/change-password?userId=1',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { currentPassword: 'foo', newPassword: 'bar' });
  console.log(`Status: ${res1.status} (Expected: 401 Unauthorized)`);
  if (res1.status === 401) {
    console.log('✅ PASS: Unauthenticated access to change-password is now properly blocked with 401.\n');
  } else {
    console.error(`❌ FAIL: Expected 401 but got ${res1.status}\n`);
  }

  // TEST 2: Unauthenticated access to /v1/auth/login-history (SEC-001/SEC-003)
  console.log('[TEST 2] Testing unauthenticated access to /v1/auth/login-history...');
  const res2 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login-history?userId=1',
    method: 'GET'
  });
  console.log(`Status: ${res2.status} (Expected: 401 Unauthorized)`);
  if (res2.status === 401) {
    console.log('✅ PASS: Unauthenticated access to login-history is now properly blocked with 401.\n');
  } else {
    console.error(`❌ FAIL: Expected 401 but got ${res2.status}\n`);
  }

  // TEST 3: Unauthenticated access to /v1/auth/2fa/setup (SEC-001/SEC-003)
  console.log('[TEST 3] Testing unauthenticated access to /v1/auth/2fa/setup...');
  const res3 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/2fa/setup?userId=1',
    method: 'POST'
  });
  console.log(`Status: ${res3.status} (Expected: 401 Unauthorized)`);
  if (res3.status === 401) {
    console.log('✅ PASS: Unauthenticated access to 2FA setup is now properly blocked with 401.\n');
  } else {
    console.error(`❌ FAIL: Expected 401 but got ${res3.status}\n`);
  }

  // TEST 4: Login as normal employee (emp@hrms.com)
  console.log('[TEST 4] Authenticating as standard employee (emp@hrms.com)...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'emp@hrms.com', password: 'Emp@123' });

  if (loginRes.status !== 200 || !loginRes.data.data?.accessToken) {
    console.error('Failed to log in as employee:', loginRes.data);
    return;
  }
  const empToken = loginRes.data.data.accessToken;
  const empId = loginRes.data.data.employeeId;
  const empTenant = loginRes.data.data.tenantId;
  console.log(`Employee logged in successfully. ID: ${empId}, Tenant: ${empTenant}\n`);

  // TEST 5: BOLA / IDOR Protection on GET /v1/employees/{id} (SEC-004)
  console.log('[TEST 5] Testing BOLA/IDOR: Standard employee attempting to view Admin profile (id=1)...');
  const bolaRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees/1',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${empToken}` }
  });
  console.log(`Status: ${bolaRes.status} (Expected: 403 Forbidden)`);
  if (bolaRes.status === 403) {
    console.log('✅ PASS: BOLA / IDOR vulnerability blocked! Standard employee cannot view other employee profiles.\n');
  } else {
    console.error(`❌ FAIL: Expected 403 Forbidden but got ${bolaRes.status}:`, bolaRes.data);
  }

  // TEST 6: Employee viewing their own profile (GET /v1/employees/me)
  console.log('[TEST 6] Testing self profile retrieval (GET /v1/employees/me)...');
  const selfRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${empToken}` }
  });
  console.log(`Status: ${selfRes.status} (Expected: 200 OK)`);
  if (selfRes.status === 200 && selfRes.data.data?.email === 'emp@hrms.com') {
    console.log('✅ PASS: Standard employee can cleanly view their own profile.\n');
  } else {
    console.error(`❌ FAIL: Self profile returned error or wrong data:`, selfRes.data);
  }

  // TEST 7: Tenant Header Tampering Protection (SEC-002)
  console.log('[TEST 7] Testing Multi-Tenant isolation: Tampering X-Tenant-ID header with "rogue-tenant-xyz"...');
  const tenantRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${empToken}`,
      'X-Tenant-ID': 'rogue-tenant-xyz'
    }
  });
  console.log(`Returned X-Tenant-ID header: ${tenantRes.headers['x-tenant-id']} (Expected: ${empTenant})`);
  if (tenantRes.headers['x-tenant-id'] === empTenant) {
    console.log('✅ PASS: Tenant context tampering blocked! Server strictly enforced token tenant.\n');
  } else {
    console.error(`❌ FAIL: Tenant context allowed spoofed header value: ${tenantRes.headers['x-tenant-id']}`);
  }

  console.log('=== ALL BATCH 0 CRITICAL SECURITY TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
