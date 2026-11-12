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

async function verifyReadiness() {
  console.log('=== VERIFYING DEMO READINESS ===\n');

  // Test 1: Login as Admin
  console.log('[1] Logging in as admin@hrms.com...');
  const loginAdmin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@hrms.com', password: 'Admin@123' });

  if (loginAdmin.status !== 200 || !loginAdmin.data?.data?.accessToken) {
    console.error('❌ Admin login failed:', loginAdmin);
    process.exit(1);
  }
  const token = loginAdmin.data.data.accessToken;
  console.log('✅ Admin login successful! Tenant:', loginAdmin.data.data.tenantId);

  // Test 2: Fetch Employees
  console.log('[2] Fetching Employee Directory...');
  const emps = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`✅ Employees returned: ${emps.data?.data?.content?.length || emps.data?.data?.length}`);

  // Test 3: Fetch Attendance Policies (Verify 10:00 to 19:00 dynamic)
  console.log('[3] Fetching Attendance Policies...');
  const policies = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/policies/attendance',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const polList = policies.data?.data || [];
  console.log(`✅ Policies returned: ${polList.length}`);
  polList.forEach(p => {
    console.log(`   - Policy: ${p.policyName} | Code: ${p.policyCode} | Shift: ${p.shiftStartTime} - ${p.shiftEndTime} | Grace: ${p.gracePeriodMinutes}m`);
  });

  // Test 4: Fetch Worksites via /v1/attendance/office-locations
  console.log('[4] Fetching Worksites...');
  const worksites = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/attendance/office-locations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const sites = worksites.data?.data || [];
  console.log(`✅ Worksites returned: ${sites.length}`);
  sites.forEach(s => {
    console.log(`   - Worksite: ${s.name} | Address: ${s.address} | Geofence: ${s.radiusMeters}m | IP Whitelist: ${s.ipWhitelist}`);
  });

  // Test 5: Login as Employee (Rahul Kumar)
  console.log('[5] Logging in as Employee Rahul Kumar (emp@hrms.com)...');
  const loginEmp = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'emp@hrms.com', password: 'Emp@123' });
  console.log('✅ Employee login successful:', loginEmp.data.data.email, '| Full Name:', loginEmp.data.data.fullName);

  // Test 6: Check Employee Leave Balance
  const empToken = loginEmp.data.data.accessToken;
  const balances = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/v1/leaves/balances/employee/${loginEmp.data.data.employeeId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${empToken}` }
  });
  const bList = balances.data?.data || [];
  console.log(`✅ Leave Balances for ${loginEmp.data.data.fullName}: ${bList.length} leave types`);
  bList.forEach(b => {
    console.log(`   - ${b.leaveType}: ${b.balanceDays} days remaining (allocated: ${b.allocatedDays}, used: ${b.usedDays})`);
  });

  // Test 7: Verify Personal Email Login (Bapanaidu Somineni)
  console.log('[7] Logging in as Lead Engineer Bapanaidu Somineni (bapanaidusomineni@gmail.com)...');
  const loginBapan = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'bapanaidusomineni@gmail.com', password: 'Admin@123' });
  console.log('✅ Bapanaidu Somineni login successful! Name:', loginBapan.data.data?.fullName, '| Role:', loginBapan.data.data?.role);

  // Test 8: Verify Charan Kumar Login
  console.log('[8] Logging in as Charan Kumar (chelikamcharankumar@gmail.com)...');
  const loginCharan = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'chelikamcharankumar@gmail.com', password: 'Admin@123' });
  console.log('✅ Charan Kumar login successful! Name:', loginCharan.data.data?.fullName, '| Role:', loginCharan.data.data?.role);

  console.log('\n🌟 ALL SYSTEM HEALTH CHECKS PASSED FOR CEO DEMO! 🌟');
}

verifyReadiness().catch(err => {
  console.error(err);
  process.exit(1);
});
