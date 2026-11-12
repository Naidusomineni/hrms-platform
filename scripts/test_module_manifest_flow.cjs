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
  console.log('=== TEST: FULL END-TO-END MODULE ENABLING & DISABLING FLOW ===\n');

  // 1. Authenticate as Admin
  console.log('--- Step 1: Admin Authentication ---');
  const loginRes = await request('/v1/auth/login', 'POST', {
    email: 'admin@hrms.com',
    password: 'Admin@123'
  });
  if (loginRes.status !== 200 || !loginRes.body.data?.accessToken) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.data.accessToken;
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  console.log('✓ Admin authenticated successfully.');

  // 2. Fetch all modules
  console.log('\n--- Step 2: Fetch Current Tenant Module Manifests ---');
  const modsRes = await request('/v1/tenant/modules', 'GET', null, authHeaders);
  console.log(`Found ${modsRes.body.data.length} registered system modules.`);
  const recruitMod = modsRes.body.data.find(m => m.moduleKey === 'RECRUITMENT');
  console.log('RECRUITMENT status in DB:', recruitMod);

  // 3. Verify access while enabled
  console.log('\n--- Step 3: Call Recruitment API While Module is ENABLED ---');
  const beforeRes = await request('/v1/recruitment/jobs', 'GET', null, authHeaders);
  console.log(`HTTP Status: ${beforeRes.status} (Expected: 200)`);
  if (beforeRes.status !== 200) {
    throw new Error('Expected 200 while module enabled, got: ' + beforeRes.status);
  }
  console.log('✓ Successfully accessed /v1/recruitment/jobs.');

  // 4. Disable RECRUITMENT module
  console.log('\n--- Step 4: Organization Admin Disables RECRUITMENT Module ---');
  const toggleOffRes = await request('/v1/tenant/modules/RECRUITMENT', 'PUT', { enabled: false }, authHeaders);
  console.log('Toggle OFF response:', toggleOffRes.body);
  if (toggleOffRes.status !== 200 || toggleOffRes.body.data.isEnabled !== false) {
    throw new Error('Failed to toggle module OFF');
  }
  console.log('✓ RECRUITMENT module is now persisted as DISABLED in PostgreSQL.');

  // Verify /v1/tenant/modules/enabled does NOT contain RECRUITMENT
  const enabledListRes = await request('/v1/tenant/modules/enabled', 'GET', null, authHeaders);
  const isStillInList = enabledListRes.body.data.includes('RECRUITMENT');
  if (isStillInList) throw new Error('RECRUITMENT should not be in enabled list!');
  console.log('✓ Confirmed RECRUITMENT removed from active tenant subscription manifest.');

  // 5. Verify Backend Security Interception (403 Forbidden)
  console.log('\n--- Step 5: Verify Backend API Security Interception When Disabled ---');
  const blockedRes = await request('/v1/recruitment/jobs', 'GET', null, authHeaders);
  console.log(`HTTP Status: ${blockedRes.status} (Expected: 403 Forbidden)`);
  console.log('Blocked response body:', blockedRes.body);
  if (blockedRes.status !== 403) {
    throw new Error('Expected HTTP 403 Forbidden when module is disabled, but got: ' + blockedRes.status);
  }
  console.log('✓ Backend TenantModuleEnforcementFilter successfully blocked access with HTTP 403 Forbidden!');

  // 6. Re-Enable RECRUITMENT module
  console.log('\n--- Step 6: Organization Admin Re-Enables RECRUITMENT Module ---');
  const toggleOnRes = await request('/v1/tenant/modules/RECRUITMENT', 'PUT', { enabled: true }, authHeaders);
  console.log('Toggle ON response:', toggleOnRes.body);
  if (toggleOnRes.status !== 200 || toggleOnRes.body.data.isEnabled !== true) {
    throw new Error('Failed to re-enable module');
  }
  console.log('✓ RECRUITMENT module re-enabled in database.');

  // 7. Verify API access restored
  console.log('\n--- Step 7: Verify API Access Restored (HTTP 200) ---');
  const afterRes = await request('/v1/recruitment/jobs', 'GET', null, authHeaders);
  console.log(`HTTP Status: ${afterRes.status} (Expected: 200)`);
  if (afterRes.status !== 200) {
    throw new Error('Expected 200 after re-enabling module, got: ' + afterRes.status);
  }
  console.log('✓ Recruitment API access immediately restored upon re-enabling.');

  console.log('\n======================================================');
  console.log('✅ FULL MODULE ENABLING & DISABLING FLOW IS 100% OPERATIONAL!');
  console.log('======================================================');
}

run().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});

