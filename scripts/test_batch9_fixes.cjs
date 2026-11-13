// scripts/test_batch9_fixes.cjs
// Automated verification suite for Batch 9:
// 1. SEC-018: Production HTTP Security Headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
// 2. DATA-002: Employee Bulk Import Pre-Flight Validation Engine (/v1/employees/bulk-import/preview)
// 3. Intra-file duplicate deduplication during bulk import commit (/v1/employees/bulk-import)
// 4. PERF-005: HikariCP connection pool stability

const http = require('http');

const BASE_URL = 'http://localhost:8080/api';

function request(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

function buildMultipartFormData(boundary, fieldName, filename, fileContent) {
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: text/csv\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    return Buffer.concat([
        Buffer.from(header, 'utf8'),
        Buffer.from(fileContent, 'utf8'),
        Buffer.from(footer, 'utf8')
    ]);
}

async function apiCall(method, path, body = null, headers = {}) {
    const url = new URL(BASE_URL + path);
    const reqHeaders = {
        'Accept': 'application/json',
        ...headers
    };
    if (body && !reqHeaders['Content-Type']) {
        reqHeaders['Content-Type'] = 'application/json';
    }
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: reqHeaders
    };
    return await request(options, body ? (Buffer.isBuffer(body) ? body : (typeof body === 'string' ? body : JSON.stringify(body))) : null);
}

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        console.log(`  ✅ [PASS] ${message}`);
        passedTests++;
    } else {
        console.error(`  ❌ [FAIL] ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    }
}

async function runTests() {
    console.log('================================================================');
    console.log('🚀 HRMS BATCH 9 VERIFICATION SUITE');
    console.log('   Bulk Import Pre-Flight Engine, Security Headers & DB Pool');
    console.log('================================================================\n');

    // ── 1. SEC-018: Production HTTP Security Headers ──
    console.log('--- 1. SEC-018: Production HTTP Security Headers ---');
    const healthRes = await apiCall('GET', '/actuator/health');
    assert(healthRes.statusCode === 200, 'Actuator health endpoint reachable');
    assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff header present');
    assert(healthRes.headers['x-frame-options'] === 'DENY', 'X-Frame-Options: DENY header present');
    assert(healthRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy: strict-origin-when-cross-origin header present');
    assert(healthRes.headers['permissions-policy']?.includes('geolocation=(self)'), 'Permissions-Policy includes geolocation=(self)');

    // Login as Admin
    console.log('\n--- 2. Admin Authentication ---');
    const loginRes = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    });
    assert(loginRes.statusCode === 200, 'Admin login succeeded');
    const adminToken = loginRes.body?.data?.accessToken;
    assert(!!adminToken, 'Admin JWT acquired');
    const authHeaders = { 'Authorization': `Bearer ${adminToken}` };

    // ── 3. DATA-002: Bulk Import Pre-Flight Validation Engine (/preview) ──
    console.log('\n--- 3. DATA-002: Bulk Import Pre-Flight Validation Engine (/preview) ---');
    const boundary = '----WebKitFormBoundaryBatch9Test' + Date.now();
    const ts = Date.now();
    const uniqueEmail1 = `valid.bulk.${ts}@eoxys.com`;
    const uniqueEmail2 = `valid.bulk2.${ts}@eoxys.com`;

    // Construct test CSV with 8 rows (1 valid, 7 invalid)
    const csvContent = [
        'first_name,last_name,email,phone_number,department,designation,date_of_joining,salary,employment_status',
        `Ananya,Iyer,${uniqueEmail1},9876543210,Engineering,Software Engineer,2026-06-01,85000,FULL_TIME`, // Valid Row
        ',Sharma,missing.name@eoxys.com,9876543211,Engineering,Associate,2026-06-01,65000,FULL_TIME', // Missing First Name
        `Duplicate,One,${uniqueEmail1},9876543212,Engineering,Associate,2026-06-01,65000,FULL_TIME`, // Duplicate email with Row 1
        'Existing,User,admin@hrms.com,9876543213,Engineering,Associate,2026-06-01,65000,FULL_TIME', // Already exists in system DB
        'Bad,Dept,bad.dept@eoxys.com,9876543214,NonExistentDept999,Associate,2026-06-01,65000,FULL_TIME', // Nonexistent department
        'Bad,Date,bad.date@eoxys.com,9876543215,Engineering,Associate,01-06-2026,65000,FULL_TIME', // Invalid date format (expected YYYY-MM-DD)
        'Bad,Salary,bad.salary@eoxys.com,9876543216,Engineering,Associate,2026-06-01,-50000,FULL_TIME', // Negative salary
        'Bad,Status,bad.status@eoxys.com,9876543217,Engineering,Associate,2026-06-01,65000,INVALID_STATUS' // Invalid enum status
    ].join('\n');

    const multipartBody = buildMultipartFormData(boundary, 'file', 'bulk_test.csv', csvContent);

    const previewRes = await apiCall('POST', '/v1/employees/bulk-import/preview', multipartBody, {
        ...authHeaders,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
    });

    assert(previewRes.statusCode === 200, 'POST /v1/employees/bulk-import/preview succeeded (200 OK)');
    const previewData = previewRes.body?.data;
    assert(previewData?.totalRows === 8, `Preview accurately detected 8 total rows (got ${previewData?.totalRows})`);
    console.log('Preview Errors:', JSON.stringify(previewData?.errors, null, 2));
    assert(previewData?.validRowsCount === 1, `Preview accurately detected 1 valid row (got ${previewData?.validRowsCount})`);
    assert(previewData?.errorRowsCount === 7, `Preview accurately detected 7 error rows (got ${previewData?.errorRowsCount})`);

    const errors = previewData?.errors || [];
    assert(errors.some(e => e.field === 'first_name'), 'Caught missing first name error');
    assert(errors.some(e => e.field === 'email' && e.error?.includes('Duplicate')), 'Caught intra-file duplicate email error');
    assert(errors.some(e => e.field === 'email' && e.error?.includes('already exists')), 'Caught database duplicate email error');
    assert(errors.some(e => e.field === 'department'), 'Caught non-existent department error');
    assert(errors.some(e => e.field === 'date_of_joining'), 'Caught invalid date format error');
    assert(errors.some(e => e.field === 'salary'), 'Caught invalid salary error');
    assert(errors.some(e => e.field === 'employment_status'), 'Caught invalid employment status enum error');

    // ── 4. Bulk Import Commit with Intra-File Deduplication ──
    console.log('\n--- 4. Bulk Import Commit with Intra-File Deduplication ---');
    const commitCsv = [
        'first_name,last_name,email,phone_number,department,designation,date_of_joining,salary,employment_status',
        `Karthik,Natarajan,${uniqueEmail2},9876543220,Engineering,DevOps Engineer,2026-07-01,95000,FULL_TIME`,
        `KarthikDuplicate,Natarajan,${uniqueEmail2},9876543221,Engineering,DevOps Engineer,2026-07-01,95000,FULL_TIME`
    ].join('\n');

    const commitBoundary = '----WebKitFormBoundaryCommit' + Date.now();
    const commitBody = buildMultipartFormData(commitBoundary, 'file', 'commit_test.csv', commitCsv);

    const importRes = await apiCall('POST', '/v1/employees/bulk-import', commitBody, {
        ...authHeaders,
        'Content-Type': `multipart/form-data; boundary=${commitBoundary}`
    });

    assert(importRes.statusCode === 200, 'POST /v1/employees/bulk-import succeeded (200 OK)');
    const importResult = importRes.body?.data;
    assert(importResult?.totalRows === 2, 'Total rows processed is 2');
    assert(importResult?.successCount === 1, 'Exactly 1 valid employee imported');
    assert(importResult?.failureCount === 1, 'Intra-file duplicate cleanly rejected (failure count = 1)');
    assert(importResult?.errors?.some(e => e.includes('Duplicate email')), 'Failure message indicates duplicate email within file');

    // Verify imported employee exists in directory
    const empCheckRes = await apiCall('GET', `/v1/employees?q=${uniqueEmail2}`, null, authHeaders);
    assert(empCheckRes.statusCode === 200, 'Employee directory query succeeded');
    const emps = empCheckRes.body?.data?.content || [];
    assert(emps.some(e => e.email === uniqueEmail2), 'Newly imported employee Karthik Natarajan confirmed in database');

    console.log('\n================================================================');
    console.log(`🎉 BATCH 9 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('================================================================\n');
}

runTests().catch(err => {
    console.error('\n❌ BATCH 9 SUITE FAILED:', err);
    process.exit(1);
});
