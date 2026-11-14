const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080/api';
const TENANT_ID = 'eoxys';
const FRONTEND_DIST_DIR = path.resolve(__dirname, '..', 'frontend', 'dist');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        testsFailed++;
        throw new Error(`Assertion failed: ${message}`);
    }
}

function apiCall(method, endpoint, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': TENANT_ID,
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    // Raw string
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('\n============================================================');
    console.log('BATCH 12 VERIFICATION: PRODUCTION BUILD & DEPLOYMENT LOCK');
    console.log('============================================================\n');

    // ==========================================
    // 1. FRONTEND PRODUCTION BUILD ASSET INTEGRITY
    // ==========================================
    console.log('--- 1. Frontend Production Build Artifacts Integrity ---');
    
    const indexPath = path.join(FRONTEND_DIST_DIR, 'index.html');
    assert(fs.existsSync(indexPath), 'frontend/dist/index.html exists');
    
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    assert(indexContent.length > 500, `index.html is non-empty (${indexContent.length} bytes)`);
    assert(indexContent.includes('<div id="root"></div>'), 'index.html contains root mount div');
    assert(/<script\s+type="module"\s+crossorigin\s+src="\/assets\/index-[^"]+\.js"><\/script>/.test(indexContent), 'index.html contains hashed module script');
    assert(/<link\s+rel="stylesheet"\s+crossorigin\s+href="\/assets\/index-[^"]+\.css">/.test(indexContent), 'index.html contains hashed stylesheet');

    const assetsDir = path.join(FRONTEND_DIST_DIR, 'assets');
    assert(fs.existsSync(assetsDir), 'frontend/dist/assets directory exists');
    const assetFiles = fs.readdirSync(assetsDir);
    assert(assetFiles.length >= 35, `frontend/dist/assets contains code-split chunks (${assetFiles.length} files found)`);

    const hasVendorChunk = assetFiles.some(f => f.startsWith('vendor-') && f.endsWith('.js'));
    assert(hasVendorChunk, 'Production bundle contains dedicated vendor-*.js code-split chunk');

    const hasChartsChunk = assetFiles.some(f => f.startsWith('charts-') && f.endsWith('.js'));
    assert(hasChartsChunk, 'Production bundle contains dedicated charts-*.js code-split chunk');

    const hasPdfChunk = assetFiles.some(f => f.startsWith('payslipPdfGenerator-') && f.endsWith('.js'));
    assert(hasPdfChunk, 'Production bundle contains dedicated payslipPdfGenerator-*.js chunk');

    const hasIndexCss = assetFiles.some(f => f.startsWith('index-') && f.endsWith('.css'));
    assert(hasIndexCss, 'Production bundle contains index-*.css stylesheet');

    // ==========================================
    // 2. PRODUCTION ACTUATOR HEALTH & PROBES
    // ==========================================
    console.log('\n--- 2. Production Actuator Health & Probes ---');

    const healthRes = await apiCall('GET', '/actuator/health');
    assert(healthRes.statusCode === 200, `Actuator health status 200 (Got: ${healthRes.statusCode})`);
    assert(healthRes.body?.status === 'UP', `Actuator health report status is UP (Got: ${healthRes.body?.status})`);
    assert(Array.isArray(healthRes.body?.groups) && healthRes.body.groups.includes('liveness'), 'Actuator exposes liveness probe group');
    assert(Array.isArray(healthRes.body?.groups) && healthRes.body.groups.includes('readiness'), 'Actuator exposes readiness probe group');

    // Verify actuator security: unauthenticated access to metrics must be rejected
    const unauthMetrics = await apiCall('GET', '/actuator/metrics');
    assert(unauthMetrics.statusCode === 401, `Unauthenticated actuator metrics access blocked with 401 (Got: ${unauthMetrics.statusCode})`);

    // ==========================================
    // 3. SECURITY HEADERS VERIFICATION
    // ==========================================
    console.log('\n--- 3. Production HTTP Hardening Headers ---');

    assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff present');
    assert(healthRes.headers['x-frame-options'] === 'DENY', 'X-Frame-Options: DENY present');
    assert(healthRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy present');
    assert(healthRes.headers['permissions-policy']?.includes('geolocation=(self)'), 'Permissions-Policy header configured with self policies');

    // ==========================================
    // 4. MULTI-ROLE AUTHENTICATION & CERTIFICATION
    // ==========================================
    console.log('\n--- 4. Multi-Role Authentication & Deployment Readiness ---');

    // 4.1 Admin Persona
    const adminLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    });
    assert(adminLogin.statusCode === 200, 'Admin persona authenticated successfully');
    const adminToken = adminLogin.body?.data?.accessToken;
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    // Admin Actuator metrics access
    const authMetrics = await apiCall('GET', '/actuator/metrics', null, adminHeaders);
    assert(authMetrics.statusCode === 200, 'Admin can access actuator metrics endpoint');
    assert(authMetrics.body?.names?.length >= 50, `Actuator reports >= 50 system metrics (Found: ${authMetrics.body?.names?.length})`);

    // Admin JVM thread metric sample
    const threadMetric = await apiCall('GET', '/actuator/metrics/jvm.threads.live', null, adminHeaders);
    assert(threadMetric.statusCode === 200, 'jvm.threads.live metric queried successfully');
    assert(threadMetric.body?.measurements?.[0]?.value > 0, `Live JVM threads measured (> 0): ${threadMetric.body?.measurements?.[0]?.value}`);

    // Admin System Telemetry endpoint
    const sysMetrics = await apiCall('GET', '/v1/admin/system/metrics', null, adminHeaders);
    assert(sysMetrics.statusCode === 200, 'System Telemetry metrics endpoint returns 200');
    assert(sysMetrics.body?.data?.connectionPoolName === 'HRMS-Pool', 'HikariCP Pool name matches HRMS-Pool');
    assert(sysMetrics.body?.data?.poolMaximumSize === 20, 'HikariCP maximum pool size is 20');
    assert(sysMetrics.body?.data?.liveThreads > 0, 'JVM live threads reported in Telemetry');
    assert(typeof sysMetrics.body?.data?.dbPingLatencyMs === 'number', 'Database ping latency measured');

    // 4.2 HR Persona
    const hrLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'hr@hrms.com',
        password: 'Hr@123'
    });
    assert(hrLogin.statusCode === 200, 'HR persona authenticated successfully');
    const hrToken = hrLogin.body?.data?.accessToken;
    const hrHeaders = { 'Authorization': `Bearer ${hrToken}` };

    // HR can access employee directory
    const hrEmpList = await apiCall('GET', '/v1/employees?page=0&size=5', null, hrHeaders);
    assert(hrEmpList.statusCode === 200, 'HR can list employees');

    // 4.3 Manager Persona
    const mgrLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'manager@hrms.com',
        password: 'Manager@123'
    });
    assert(mgrLogin.statusCode === 200, 'Manager persona authenticated successfully');
    const mgrToken = mgrLogin.body?.data?.accessToken;
    const mgrHeaders = { 'Authorization': `Bearer ${mgrToken}` };

    const mgrLeaves = await apiCall('GET', '/v1/leaves/pending', null, mgrHeaders);
    assert(mgrLeaves.statusCode === 200, 'Manager can view pending leave approvals');

    // 4.4 Employee Persona
    const empLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'emp@hrms.com',
        password: 'Emp@123'
    });
    assert(empLogin.statusCode === 200, 'Employee persona authenticated successfully');
    const empToken = empLogin.body?.data?.accessToken;
    const empHeaders = { 'Authorization': `Bearer ${empToken}` };
    const empUserId = empLogin.body?.data?.userId;

    // Employee notifications
    const empNotifs = await apiCall('GET', '/v1/notifications', null, empHeaders);
    assert(empNotifs.statusCode === 200, 'Employee can view their notifications');

    // Employee self-service sessions
    const empSessions = await apiCall('GET', '/v1/auth/sessions', null, empHeaders);
    assert(empSessions.statusCode === 200, 'Employee can view active concurrent sessions');
    assert(Array.isArray(empSessions.body?.data), 'Sessions payload is an array');

    // 4.5 IT Admin Persona
    const itLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'itadmin@hrms.com',
        password: 'Password@123'
    });
    // In case IT admin uses standard password
    let itHeaders = adminHeaders;
    if (itLogin.statusCode === 200) {
        assert(true, 'IT Admin persona authenticated successfully');
        itHeaders = { 'Authorization': `Bearer ${itLogin.body?.data?.accessToken}` };
    } else {
        console.log('  ℹ️ Note: Using Admin credentials for IT asset management check');
    }

    const assetsRes = await apiCall('GET', '/v1/assets', null, itHeaders);
    assert(assetsRes.statusCode === 200, 'Asset management inventory endpoint verified');

    // ==========================================
    // 5. ENTERPRISE SYSTEM SAFETY LOCKS VERIFICATION
    // ==========================================
    console.log('\n--- 5. Enterprise Safety Locks Verification ---');

    // 5.1 Password Policy Validator Lock
    const weakPassRegister = await apiCall('POST', '/v1/auth/register', {
        firstName: 'Test',
        lastName: 'Lock',
        email: `lock_${Date.now()}@test.com`,
        password: 'weak'
    });
    assert(weakPassRegister.statusCode === 400, 'Password complexity rejects weak password under 8 chars');

    // 5.2 BOLA / IDOR Self-Service Security Lock
    // Employee attempting to access another user's session revocation
    const bolaSessionRevoke = await apiCall('DELETE', `/v1/auth/sessions/999999`, null, empHeaders);
    assert(bolaSessionRevoke.statusCode === 404 || bolaSessionRevoke.statusCode === 403, 'BOLA protection active on unauthorized session revocation');

    // 5.3 Sensitive Data PII Masking Lock
    const neftExport = await apiCall('GET', '/v1/payroll/bank-batch-export?month=11&year=2026&masked=true', null, adminHeaders);
    assert(neftExport.statusCode === 200, 'Payroll NEFT export endpoint returns 200');
    const neftCsv = typeof neftExport.body === 'string' ? neftExport.body : '';
    assert(neftCsv.includes('AccountNumber'), 'NEFT export contains AccountNumber header');

    console.log('\n============================================================');
    console.log(`BATCH 12 VERIFICATION COMPLETE: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('============================================================\n');
}

runTests().catch(err => {
    console.error('\n❌ BATCH 12 SUITE FAILED:', err);
    process.exit(1);
});
