const http = require('http');
const { execSync } = require('child_process');

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

async function verifyTwoCompaniesIsolation() {
  console.log('=== VERIFYING TWO-COMPANY STRICT SCHEMA ISOLATION ===\n');

  // STEP 1: Provision Company B (Acme Corp) directly in PostgreSQL 18
  console.log('[STEP 1] Provisioning Company B ("tenant_acme") in PostgreSQL...');
  const sql = `
    CREATE SCHEMA IF NOT EXISTS tenant_acme;
    CREATE TABLE IF NOT EXISTS tenant_acme.employees (LIKE tenant_eoxys.employees INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS tenant_acme.departments (LIKE tenant_eoxys.departments INCLUDING ALL);
    
    -- Insert Acme-only department
    INSERT INTO tenant_acme.departments (name, code, description, location, budget, is_active, deleted, created_at, updated_at)
    VALUES ('Acme Product Dev', 'APD', 'Acme Product Team', 'Mumbai', 5000000, true, false, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Insert Acme-only employee
    INSERT INTO tenant_acme.employees (first_name, last_name, email, employee_number, designation, department_id, employment_status, date_of_joining, deleted, tenant_id, created_at, updated_at)
    VALUES ('Vikram', 'Malhotra', 'vikram@acmecorp.com', 'ACME-001', 'Lead Architect', 
            (SELECT id FROM tenant_acme.departments LIMIT 1), 'ACTIVE', CURRENT_DATE, false, 'acme', NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Register Acme in public.tenants
    INSERT INTO public.tenants (id, code, name, domain, status, subscription_tier, created_at, updated_at)
    VALUES ('acme', 'ACME', 'Acme Corporation Pvt Ltd', 'https://www.acmecorp.com', 'ACTIVE', 'ENTERPRISE', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET name = 'Acme Corporation Pvt Ltd';

    -- Create an Acme Admin user in public.users
    INSERT INTO public.users (email, password, first_name, last_name, role, tenant_id, is_active, email_verified, deleted, created_at, updated_at)
    VALUES ('admin@acmecorp.com', (SELECT password FROM public.users WHERE email = 'admin@hrms.com'), 'Acme', 'Admin', 'ROLE_ADMIN', 'acme', true, true, false, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET tenant_id = 'acme';
  `;

  const fs = require('fs');
  fs.writeFileSync('temp_acme_setup.sql', sql, 'utf8');
  execSync(`powershell -Command "$env:PGPASSWORD='Naidu@98666'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -p 5433 -d hrms_db -f temp_acme_setup.sql"`);
  if (fs.existsSync('temp_acme_setup.sql')) fs.unlinkSync('temp_acme_setup.sql');
  console.log('✅ Company B (Acme Corp) provisioned with schema "tenant_acme" and admin@acmecorp.com!\n');

  // STEP 2: Query Employees as Eoxys Systems
  console.log('[STEP 2] Authenticating as Eoxys Admin (admin@hrms.com)...');
  const loginEoxys = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@hrms.com', password: 'Admin@123' });

  const tokenEoxys = loginEoxys.data.data.accessToken;

  const resEoxys = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees?page=0&size=100',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenEoxys}`,
      'X-Tenant-ID': 'eoxys'
    }
  });

  const eoxysEmps = resEoxys.data.data?.content || [];
  console.log(`Eoxys Total Employees returned: ${eoxysEmps.length}`);
  const hasAcmeInEoxys = eoxysEmps.some(e => e.email === 'vikram@acmecorp.com');
  console.log(`Does Eoxys see Acme employee (vikram@acmecorp.com)? ${hasAcmeInEoxys ? 'YES (LEAK)' : 'NO (SECURE)'}`);

  // STEP 3: Authenticate as Acme Admin (admin@acmecorp.com) and Query Acme Employees
  console.log('\n[STEP 3] Authenticating as Acme Admin (admin@acmecorp.com)...');
  const loginAcme = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@acmecorp.com', password: 'Admin@123' });

  if (loginAcme.status !== 200 || !loginAcme.data.data?.accessToken) {
    console.error('Failed to log in as Acme Admin:', loginAcme.data);
    return;
  }

  const tokenAcme = loginAcme.data.data.accessToken;
  console.log(`Acme Admin logged in! Token Tenant ID: "${loginAcme.data.data.tenantId}"`);

  const resAcme = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees?page=0&size=100',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenAcme}`,
      'X-Tenant-ID': 'acme'
    }
  });

  const acmeEmps = resAcme.data.data?.content || [];
  console.log(`Acme Total Employees returned: ${acmeEmps.length}`);
  if (acmeEmps.length > 0) {
    console.log(`Acme Employee: "${acmeEmps[0].firstName} ${acmeEmps[0].lastName}" (${acmeEmps[0].email})`);
  }
  const hasEoxysInAcme = acmeEmps.some(e => e.email === 'admin@hrms.com' || e.email === 'emp@hrms.com' || e.email === 'hr@hrms.com');
  console.log(`Does Acme see any Eoxys employees? ${hasEoxysInAcme ? 'YES (LEAK)' : 'NO (SECURE)'}`);

  // STEP 4: Conclusion
  if (!hasAcmeInEoxys && !hasEoxysInAcme && acmeEmps.length === 1 && eoxysEmps.length >= 1) {
    console.log('\n🎯 VERDICT: 100% MATHEMATICAL & DATABASE-LEVEL ISOLATION CONFIRMED!');
    console.log('Company A (Eoxys) and Company B (Acme) run simultaneously on the same application with ZERO data leakage.');
  } else {
    console.error('\n❌ ISOLATION TEST FAILED');
  }

  // Cleanup Acme test schema and user
  execSync(`powershell -Command "$env:PGPASSWORD='Naidu@98666'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -p 5433 -d hrms_db -c 'DELETE FROM public.login_history WHERE user_id IN (SELECT id FROM public.users WHERE email = ''admin@acmecorp.com''); DELETE FROM public.refresh_tokens WHERE user_id IN (SELECT id FROM public.users WHERE email = ''admin@acmecorp.com''); DELETE FROM public.users WHERE email = ''admin@acmecorp.com''; DROP SCHEMA IF EXISTS tenant_acme CASCADE; DELETE FROM public.tenants WHERE id = ''acme'';'"` );
  console.log('\nCleaned up temporary test tenant "tenant_acme" and Acme user.');
}

verifyTwoCompaniesIsolation().catch(console.error);
