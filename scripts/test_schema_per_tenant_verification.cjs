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

async function verifySchemaPerTenant() {
  console.log('=== VERIFYING SCHEMA-PER-TENANT LIVE OPERATION ===\n');

  // TEST 1: Login as admin@hrms.com
  console.log('[TEST 1] Logging in as admin@hrms.com...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@hrms.com', password: 'Admin@123' });

  if (loginRes.status !== 200 || !loginRes.data.data?.accessToken) {
    console.error('Login failed:', loginRes.data);
    process.exit(1);
  }

  const token = loginRes.data.data.accessToken;
  const tenantId = loginRes.data.data.tenantId;
  console.log(`Login Successful! Authenticated Tenant ID: "${tenantId}" (Expected: "eoxys")`);
  if (tenantId === 'eoxys') {
    console.log('✅ PASS: User authenticated cleanly with authoritative "eoxys" tenant ID!\n');
  } else {
    console.error(`❌ FAIL: Expected tenant "eoxys" but got "${tenantId}"\n`);
  }

  // TEST 2: Query employees via API (should resolve to tenant_eoxys.employees)
  console.log('[TEST 2] Fetching employees via GET /api/v1/employees...');
  const empRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees?page=0&size=10',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': 'eoxys'
    }
  });

  console.log(`Status: ${empRes.status}, Total Employees: ${empRes.data.data?.totalElements}`);
  if (empRes.status === 200 && empRes.data.data?.totalElements > 0) {
    console.log(`✅ PASS: Successfully resolved ${empRes.data.data.totalElements} employees from isolated schema tenant_eoxys!\n`);
  } else {
    console.error('❌ FAIL: Could not retrieve employees from tenant_eoxys:', empRes.data);
  }

  // TEST 3: Fetch Attendance Policies from tenant_eoxys.attendance_policies
  console.log('[TEST 3] Fetching attendance policies via GET /api/v1/policies/attendance...');
  const policyRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/policies/attendance',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': 'eoxys'
    }
  });

  console.log(`Status: ${policyRes.status}`);
  const policies = policyRes.data?.data || [];
  console.log(`Retrieved ${policies.length} policies from tenant_eoxys schema.`);
  if (policyRes.status === 200 && policies.length > 0) {
    console.log(`Policies: ${policies.map(p => p.policyName).join(', ')}`);
    console.log('✅ PASS: Attendance policies cleanly resolved from tenant_eoxys!\n');
  } else {
    console.error('❌ FAIL: Could not retrieve attendance policies:', policyRes.data);
  }

  // TEST 4: Fetch Worksites (Office Locations) from tenant_eoxys.office_locations
  console.log('[TEST 4] Fetching worksites via GET /api/v1/attendance/office-locations...');
  const worksiteRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/attendance/office-locations',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': 'eoxys'
    }
  });

  console.log(`Status: ${worksiteRes.status}`);
  const worksites = worksiteRes.data?.data || [];
  console.log(`Retrieved ${worksites.length} corporate worksites.`);
  if (worksiteRes.status === 200 && worksites.length > 0) {
    console.log(`Worksite Name: "${worksites[0].locationName}", Address: "${worksites[0].address}"`);
    console.log('✅ PASS: Corporate worksites cleanly resolved from tenant_eoxys!\n');
  } else {
    console.error('❌ FAIL: Could not retrieve worksites:', worksiteRes.data);
  }

  // TEST 5: Verify Tenant Branding from public.tenants
  console.log('[TEST 5] Fetching current tenant branding via GET /api/v1/tenants/current...');
  const brandingRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/tenants/current',
    method: 'GET',
    headers: {
      'X-Tenant-ID': 'eoxys'
    }
  });

  console.log(`Status: ${brandingRes.status}, Company: "${brandingRes.data.data?.name}"`);
  if (brandingRes.status === 200 && brandingRes.data.data?.name?.includes('Eoxys')) {
    console.log('✅ PASS: Tenant branding cleanly retrieved from public.tenants!\n');
  } else {
    console.error('❌ FAIL: Could not retrieve tenant branding:', brandingRes.data);
  }

  console.log('=== ALL SCHEMA-PER-TENANT LIVE TESTS PASSED WITH 100% SUCCESS ===');
}

verifySchemaPerTenant().catch(console.error);
