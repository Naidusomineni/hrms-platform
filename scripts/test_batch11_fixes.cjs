const http = require('http');

const BASE_URL = 'http://localhost:8080/api';

function apiCall(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                ...headers
            }
        };

        if (body && typeof body === 'object' && !(body instanceof Buffer)) {
            body = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(resData);
                } catch (e) {
                    parsed = resData;
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (!condition) {
        console.error(`  ❌ [FAIL] ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    } else {
        console.log(`  ✅ [PASS] ${message}`);
        passedTests++;
    }
}

async function runTests() {
    console.log('================================================================');
    console.log('🚀 HRMS BATCH 11 VERIFICATION SUITE');
    console.log('   System Observability Telemetry & Sensitive PII Data Sanitization');
    console.log('================================================================\n');

    // ── 1. Authentication ──
    console.log('--- 1. Authentication for Roles ---');
    const adminLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    });
    assert(adminLogin.statusCode === 200, 'Admin login succeeded');
    const adminToken = adminLogin.body?.data?.accessToken;
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    const empLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'emp@hrms.com',
        password: 'Emp@123'
    });
    assert(empLogin.statusCode === 200, 'Employee login succeeded');
    const empToken = empLogin.body?.data?.accessToken;
    const empHeaders = { 'Authorization': `Bearer ${empToken}` };

    const hrLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'hr@hrms.com',
        password: 'Hr@123'
    });
    assert(hrLogin.statusCode === 200, 'HR login succeeded');
    const hrToken = hrLogin.body?.data?.accessToken;
    const hrHeaders = { 'Authorization': `Bearer ${hrToken}` };

    // ── 2. OPS-001: System Observability & Telemetry Metrics ──
    console.log('\n--- 2. OPS-001: System Observability & Telemetry Metrics ---');
    const metricsRes = await apiCall('GET', '/v1/admin/system/metrics', null, adminHeaders);
    assert(metricsRes.statusCode === 200, 'GET /v1/admin/system/metrics returns 200 OK');
    const m = metricsRes.body?.data;
    assert(m?.status === 'HEALTHY', `System database status is HEALTHY (got: ${m?.status})`);
    assert(typeof m?.dbPingLatencyMs === 'number' && m.dbPingLatencyMs >= 0, `Database roundtrip ping latency: ${m?.dbPingLatencyMs}ms`);
    assert(typeof m?.uptimeSeconds === 'number' && m.uptimeSeconds > 0, `JVM process uptime: ${m?.uptimeSeconds}s`);
    assert(typeof m?.availableProcessors === 'number' && m.availableProcessors >= 1, `Available CPU cores: ${m?.availableProcessors}`);
    assert(typeof m?.liveThreads === 'number' && m.liveThreads > 0, `Active JVM threads: ${m?.liveThreads}`);
    assert(typeof m?.peakThreads === 'number' && m.peakThreads >= m.liveThreads, `Peak JVM threads: ${m?.peakThreads}`);
    assert(typeof m?.heapUsedMb === 'number' && m.heapUsedMb > 0, `Heap memory used: ${m?.heapUsedMb}MB`);
    assert(typeof m?.heapMaxMb === 'number' && m.heapMaxMb > 0, `Heap memory max: ${m?.heapMaxMb}MB`);
    assert(typeof m?.heapUsagePercent === 'number', `Heap usage percent: ${m?.heapUsagePercent}%`);

    // HikariCP Connection Pool Verification
    assert(m?.connectionPoolName === 'HRMS-Pool', `HikariCP Pool name matches config: ${m?.connectionPoolName}`);
    assert(m?.poolMaximumSize === 20, `HikariCP maximum pool size is 20 (got: ${m?.poolMaximumSize})`);
    assert(m?.poolMinimumIdle === 5, `HikariCP minimum idle connections is 5 (got: ${m?.poolMinimumIdle})`);
    assert(typeof m?.poolTotalConnections === 'number' && m.poolTotalConnections > 0, `HikariCP total pooled connections: ${m?.poolTotalConnections}`);
    assert(typeof m?.poolActiveConnections === 'number' && m.poolActiveConnections >= 0, `HikariCP active connections: ${m?.poolActiveConnections}`);
    assert(typeof m?.poolIdleConnections === 'number' && m.poolIdleConnections >= 0, `HikariCP idle connections: ${m?.poolIdleConnections}`);
    assert(typeof m?.poolThreadsAwaitingConnection === 'number' && m.poolThreadsAwaitingConnection === 0, 'Zero threads queued/starved awaiting DB connection');

    // Security check: Employee blocked from system telemetry
    const empMetricsRes = await apiCall('GET', '/v1/admin/system/metrics', null, empHeaders);
    assert(empMetricsRes.statusCode === 403, 'Employee access to /v1/admin/system/metrics blocked with 403 Forbidden');

    // ── 3. DATA-003: Bank NEFT Batch Export Sanitization ──
    console.log('\n--- 3. DATA-003: Bank NEFT Batch Export Sanitization ---');
    // Ensure payroll batch exists for 11/2026
    const processRes = await apiCall('POST', '/v1/payroll/process-all?month=11&year=2026', {}, adminHeaders);
    assert(processRes.statusCode === 200 || processRes.statusCode === 201, 'Batch payroll draft ready for 11/2026');

    // Unmasked Bank Export
    const unmaskedBankRes = await apiCall('GET', '/v1/payroll/bank-batch-export?month=11&year=2026&masked=false', null, adminHeaders);
    assert(unmaskedBankRes.statusCode === 200, 'Unmasked bank export returns 200 OK');
    const unmaskedBankCsv = typeof unmaskedBankRes.body === 'string' ? unmaskedBankRes.body : '';
    assert(unmaskedBankCsv.includes('AccountNumber'), 'Bank export contains AccountNumber column header');
    assert(!unmaskedBankCsv.includes('••••••••'), 'Unmasked export contains zero bullet masked account numbers');

    // Masked Bank Export
    const maskedBankRes = await apiCall('GET', '/v1/payroll/bank-batch-export?month=11&year=2026&masked=true', null, adminHeaders);
    assert(maskedBankRes.statusCode === 200, 'Masked bank export returns 200 OK');
    const maskedBankCsv = typeof maskedBankRes.body === 'string' ? maskedBankRes.body : '';
    assert(maskedBankCsv.includes('••••••••'), 'Masked bank export successfully masks account numbers with ••••••••');
    assert(maskedBankRes.headers['content-disposition']?.includes('_masked.csv'), 'Filename header indicates _masked.csv');

    // ── 4. DATA-003: Employee Master Export Sanitization ──
    console.log('\n--- 4. DATA-003: Employee Master Export Sanitization ---');
    // Unmasked Employee Export
    const unmaskedEmpRes = await apiCall('GET', '/v1/employees/export?masked=false', null, hrHeaders);
    assert(unmaskedEmpRes.statusCode === 200, 'Unmasked employee directory export returns 200 OK');
    const unmaskedEmpCsv = typeof unmaskedEmpRes.body === 'string' ? unmaskedEmpRes.body : '';
    assert(unmaskedEmpCsv.includes('EmployeeNumber,FirstName,LastName'), 'Employee CSV header present');
    assert(!unmaskedEmpCsv.includes('••••••'), 'Unmasked export preserves real employee salary and phone data');

    // Masked Employee Export
    const maskedEmpRes = await apiCall('GET', '/v1/employees/export?masked=true', null, hrHeaders);
    assert(maskedEmpRes.statusCode === 200, 'Masked employee directory export returns 200 OK');
    const maskedEmpCsv = typeof maskedEmpRes.body === 'string' ? maskedEmpRes.body : '';
    assert(maskedEmpCsv.includes('••••••'), 'Masked employee export masks sensitive salary as ••••••');
    assert(maskedEmpRes.headers['content-disposition']?.includes('_masked.csv'), 'Employee export filename header reflects _masked.csv');

    // Security check: Standard employee blocked from bulk directory export
    const empExportRes = await apiCall('GET', '/v1/employees/export', null, empHeaders);
    assert(empExportRes.statusCode === 403, 'Standard employee blocked from /v1/employees/export with 403 Forbidden');

    console.log('\n================================================================');
    console.log(`🎉 BATCH 11 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('================================================================\n');
}

runTests().catch(err => {
    console.error('\n❌ BATCH 11 SUITE FAILED:', err);
    process.exit(1);
});
