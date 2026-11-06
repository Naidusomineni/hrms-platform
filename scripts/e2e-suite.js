// Comprehensive E2E API Test Suite for HRMS Platform
// Validates Authentication, Role Permissions, and all Core Domains against Live Backend

const API_BASE = 'http://localhost:8080/api/v1';

async function req(url, options = {}) {
  const fullUrl = `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    ...(options.body ? { body: options.body } : {})
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

const results = [];
function record(testName, passed, details = '') {
  results.push({ testName, passed, details });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName} ${details ? `(${details})` : ''}`);
}

async function runSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING HRMS FULL COMPREHENSIVE END-TO-END AUTOMATION SUITE');
  console.log('================================================================\n');

  // 1. Auth: Admin
  let adminToken = '';
  let adminUserId = null;
  let adminEmpId = null;
  {
    const res = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@hrms.com', password: 'Admin@123', rememberMe: false })
    });
    const pass = res.status === 200 && !!res.data?.data?.accessToken;
    adminToken = res.data?.data?.accessToken || '';
    adminUserId = res.data?.data?.userId;
    adminEmpId = res.data?.data?.user?.employeeId || 1;
    record('Auth: Login as Admin (ROLE_ADMIN)', pass, `Status: ${res.status}`);
  }

  // 2. Auth: Manager
  let managerToken = '';
  let managerUserId = null;
  let managerEmpId = null;
  {
    const res = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'manager@hrms.com', password: 'Manager@123', rememberMe: false })
    });
    const pass = res.status === 200 && !!res.data?.data?.accessToken;
    managerToken = res.data?.data?.accessToken || '';
    managerUserId = res.data?.data?.userId;
    managerEmpId = res.data?.data?.user?.employeeId || 3;
    record('Auth: Login as Manager (ROLE_MANAGER)', pass, `Status: ${res.status}`);
  }

  // 3. Auth: Employee
  let empToken = '';
  let empUserId = null;
  let empEmpId = null;
  {
    const res = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'emp@hrms.com', password: 'Emp@123', rememberMe: false })
    });
    const pass = res.status === 200 && !!res.data?.data?.accessToken;
    empToken = res.data?.data?.accessToken || '';
    empUserId = res.data?.data?.userId;
    empEmpId = res.data?.data?.user?.employeeId || 4;
    record('Auth: Login as Employee (ROLE_EMPLOYEE)', pass, `Status: ${res.status}`);
  }

  // 4. Auth: IT Admin
  let itAdminToken = '';
  let itAdminEmpId = null;
  {
    const res = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'itadmin@hrms.com', password: 'ItAdmin@123', rememberMe: false })
    });
    const pass = res.status === 200 && !!res.data?.data?.accessToken;
    itAdminToken = res.data?.data?.accessToken || '';
    itAdminEmpId = res.data?.data?.user?.employeeId || 66;
    record('Auth: Login as Dedicated IT Admin (ROLE_IT_ADMIN)', pass, `Status: ${res.status}`);
  }

  // 5. Tenant: Current White-Label Branding
  {
    const res = await req('/tenants/current', { token: adminToken });
    const pass = res.status === 200 && res.data?.data?.id === 'default';
    record('Tenant: Multi-Tenant Config (/v1/tenants/current)', pass, `Tenant Name: ${res.data?.data?.name}`);
  }

  // 6. Departments: List Departments
  {
    const res = await req('/departments', { token: adminToken });
    const isArr = Array.isArray(res.data?.data);
    const pass = res.status === 200 && isArr && res.data.data.length > 0;
    record('Departments: Corporate Department Hierarchy', pass, `Departments: ${isArr ? res.data.data.length : 0}`);
  }

  // 7. Employees: Admin Paginated Directory
  {
    const res = await req('/employees?page=0&size=10', { token: adminToken });
    const content = res.data?.data?.content || [];
    const pass = res.status === 200 && Array.isArray(content) && content.length > 0;
    record('Employees: Admin Directory Query (/v1/employees)', pass, `Loaded: ${content.length} employees`);
  }

  // 8. Employees: Self Profile Me
  {
    const res = await req('/employees/me', { token: empToken });
    const pass = res.status === 200 && res.data?.data?.email === 'emp@hrms.com';
    record('Employees: Self Profile Resolution (/v1/employees/me)', pass, `Name: ${res.data?.data?.firstName} ${res.data?.data?.lastName}`);
  }

  // 9. Attendance: Office Geofence Locations
  {
    const res = await req('/attendance/office-locations', { token: empToken });
    const isArr = Array.isArray(res.data?.data);
    const pass = res.status === 200 && isArr && res.data.data.length > 0;
    record('Attendance: Geofenced Office Locations (/v1/attendance/office-locations)', pass, `Locations: ${isArr ? res.data.data.length : 0}`);
  }

  // 10. Attendance: Today Status
  {
    const res = await req(`/attendance/today-status?employeeId=${empEmpId}`, { token: empToken });
    const pass = res.status === 200;
    record('Attendance: Daily Status Query (/v1/attendance/today-status)', pass, `Status: ${res.status}`);
  }

  // 11. Leave: Statutory Policies
  {
    const res = await req('/leaves/policies', { token: empToken });
    const isArr = Array.isArray(res.data?.data);
    const pass = res.status === 200 && isArr && res.data.data.length > 0;
    record('Leave: Statutory Leave Policies (/v1/leaves/policies)', pass, `Policies: ${isArr ? res.data.data.length : 0}`);
  }

  // 12. Leave: Employee Leave Balances
  {
    const res = await req(`/leaves/balances/employee/${empEmpId}`, { token: empToken });
    const isArr = Array.isArray(res.data?.data);
    const pass = res.status === 200 && isArr;
    record('Leave: Employee Leave Balance Ledger', pass, `Balances: ${isArr ? res.data.data.length : 0}`);
  }

  // 13. Expense Claims: My Claims
  {
    const res = await req(`/expenses/claims/my?employeeId=${empEmpId}`, { token: empToken });
    const content = res.data?.data?.content;
    const pass = res.status === 200 && Array.isArray(content);
    record('Expense: Employee Self Claims Query (/v1/expenses/claims/my)', pass, `Count: ${Array.isArray(content) ? content.length : 0}`);
  }

  // 14. Expense Claims: Manager Review Queue
  {
    const res = await req('/expenses/claims?status=SUBMITTED', { token: managerToken });
    const content = res.data?.data?.content;
    const pass = res.status === 200 && Array.isArray(content);
    record('Expense: Manager Review Queue (/v1/expenses/claims?status=SUBMITTED)', pass, `Pending Review: ${Array.isArray(content) ? content.length : 0}`);
  }

  // 15. Expense Claims: Finance Audit Queue
  {
    const res = await req('/expenses/claims?status=MANAGER_APPROVED', { token: adminToken });
    const content = res.data?.data?.content;
    const pass = res.status === 200 && Array.isArray(content);
    record('Expense: Finance Audit Queue (/v1/expenses/claims?status=MANAGER_APPROVED)', pass, `Pending Audit: ${Array.isArray(content) ? content.length : 0}`);
  }

  // 16. IT Assets: Inventory List (IT Admin persona)
  {
    const res = await req('/assets', { token: itAdminToken });
    const isArr = Array.isArray(res.data?.data);
    const pass = res.status === 200 && isArr && res.data.data.length > 0;
    record('Assets: IT Admin Inventory Master (/v1/assets)', pass, `Assets Found: ${isArr ? res.data.data.length : 0}`);
  }

  // 17. IT Assets: Custody Check (Employee Assets)
  {
    const res = await req(`/assets/employee/${empEmpId}`, { token: empToken });
    const isArr = Array.isArray(res.data?.data);
    const pass = res.status === 200 && isArr;
    record('Assets: Employee Hardware Custody (/v1/assets/employee/:id)', pass, `Allocated: ${isArr ? res.data.data.length : 0}`);
  }

  // 18. IT Service Desk: Ticket Stats KPI
  {
    const res = await req('/helpdesk/tickets/stats', { token: itAdminToken });
    const pass = res.status === 200 && !!res.data?.data;
    record('Helpdesk: Ticket KPI Telemetry (/v1/helpdesk/tickets/stats)', pass, `Total Tickets: ${res.data?.data?.total ?? 0}`);
  }

  // 19. IT Service Desk: Full Ticket Queue
  {
    const res = await req('/helpdesk/tickets?page=0&size=10', { token: itAdminToken });
    const content = res.data?.data?.content;
    const pass = res.status === 200 && Array.isArray(content);
    record('Helpdesk: Service Desk SLA Queue (/v1/helpdesk/tickets)', pass, `Queue Length: ${Array.isArray(content) ? content.length : 0}`);
  }

  // 20. Communication: Active Announcements
  {
    const res = await req('/communication/announcements', { token: empToken });
    const isArr = Array.isArray(res.data?.data);
    const pass = res.status === 200 && isArr && res.data.data.length > 0;
    record('Communication: Broadcast Announcements (/v1/communication/announcements)', pass, `Announcements: ${isArr ? res.data.data.length : 0}`);
  }

  // 21. Notifications: Employee Inbox
  {
    const res = await req(`/notifications/user/${empUserId}`, { token: empToken });
    const content = res.data?.data?.content;
    const pass = res.status === 200 && Array.isArray(content);
    record('Notifications: User Inbox Query (/v1/notifications/user/:id)', pass, `Notifications: ${Array.isArray(content) ? content.length : 0}`);
  }

  console.log('\n================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`TOTAL AUDITED ENDPOINTS: ${results.length}`);
  console.log(`✅ PASSED: ${passedCount}`);
  console.log(`❌ FAILED: ${failedCount}`);
  console.log('================================================================');
  if (failedCount > 0) process.exit(1);
}

runSuite().catch(err => {
  console.error('Fatal error during test suite:', err);
  process.exit(1);
});
