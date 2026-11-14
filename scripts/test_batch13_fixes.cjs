const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080/api';
const TENANT_ID = 'eoxys';

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
    console.log('BATCH 13 VERIFICATION: CRITICAL FILE SECURITY & PRODUCTION LOCK');
    console.log('============================================================\n');

    // ==========================================
    // 1. SEC-019: STATIC UPLOAD ROUTE HARDENING
    // ==========================================
    console.log('--- 1. SEC-019: Static Document Path Protection ---');

    // Attempt direct unauthenticated access to /uploads/documents/confidential.pdf
    const anonDocAccess = await apiCall('GET', '/uploads/documents/confidential_contract.pdf');
    assert(anonDocAccess.statusCode === 401 || anonDocAccess.statusCode === 403,
        `Anonymous access to /uploads/documents/ is strictly BLOCKED by Spring Security (Got: HTTP ${anonDocAccess.statusCode})`);

    // Public avatar assets: /uploads/profiles/ should allow public access (not returning 401)
    const publicProfileAccess = await apiCall('GET', '/uploads/profiles/non_existent_avatar.png');
    assert(publicProfileAccess.statusCode === 404,
        `Public profiles directory reaches resource handler without requiring auth (Got: HTTP ${publicProfileAccess.statusCode} Not Found)`);

    // Public logo assets: /uploads/logos/ should allow public access (not returning 401)
    const publicLogoAccess = await apiCall('GET', '/uploads/logos/non_existent_logo.png');
    assert(publicLogoAccess.statusCode === 404,
        `Public logos directory reaches resource handler without requiring auth (Got: HTTP ${publicLogoAccess.statusCode} Not Found)`);

    // ==========================================
    // 2. DOCUMENT VAULT AUTHENTICATED ACCESS
    // ==========================================
    console.log('\n--- 2. Document Vault Authenticated Access ---');

    // Login as Admin
    const adminLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    });
    assert(adminLogin.statusCode === 200, 'Admin authenticated successfully');
    const adminToken = adminLogin.body?.data?.accessToken;
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    // Login as Employee
    const empLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'emp@hrms.com',
        password: 'Emp@123'
    });
    assert(empLogin.statusCode === 200, 'Employee authenticated successfully');
    const empToken = empLogin.body?.data?.accessToken;
    const empHeaders = { 'Authorization': `Bearer ${empToken}` };
    const empId = 2;

    // Authenticated employee can list their own documents
    const empDocsRes = await apiCall('GET', `/v1/documents/employee/${empId}`, null, empHeaders);
    assert(empDocsRes.statusCode === 200, 'Employee can query their own documents via authenticated REST API');

    // Unauthenticated access to /v1/documents is blocked
    const unauthDocsRes = await apiCall('GET', `/v1/documents/employee/${empId}`);
    assert(unauthDocsRes.statusCode === 401, `Unauthenticated REST access to /v1/documents/ blocked with HTTP ${unauthDocsRes.statusCode}`);

    // BOLA check: Employee cannot access another employee's documents (e.g. employee 1 / Admin)
    const crossEmpDocsRes = await apiCall('GET', `/v1/documents/employee/1`, null, empHeaders);
    assert(crossEmpDocsRes.statusCode === 403 || crossEmpDocsRes.statusCode === 404,
        `BOLA Defense: Employee cannot access other employee documents (Got: HTTP ${crossEmpDocsRes.statusCode})`);

    // ==========================================
    // 3. PRODUCTION CONFIGURATION HARDENING
    // ==========================================
    console.log('\n--- 3. Production Configuration Hardening ---');

    const prodPropsPath = path.resolve(__dirname, '..', 'backend', 'src', 'main', 'resources', 'application-prod.properties');
    assert(fs.existsSync(prodPropsPath), 'backend/src/main/resources/application-prod.properties exists');

    const prodPropsContent = fs.readFileSync(prodPropsPath, 'utf-8');
    assert(prodPropsContent.includes('spring.flyway.enabled=true'), 'Production profile enforces spring.flyway.enabled=true');
    assert(prodPropsContent.includes('spring.jpa.hibernate.ddl-auto=validate'), 'Production profile enforces ddl-auto=validate');
    assert(prodPropsContent.includes('spring.datasource.hikari.maximum-pool-size=30'), 'Production profile configures 30 maximum connections');

    // Verify validator class is present
    const validatorPath = path.resolve(__dirname, '..', 'backend', 'src', 'main', 'java', 'com', 'hrms', 'config', 'ProductionSecurityValidator.java');
    assert(fs.existsSync(validatorPath), 'ProductionSecurityValidator.java component exists in backend');

    console.log('\n============================================================');
    console.log(`BATCH 13 VERIFICATION COMPLETE: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('============================================================\n');
}

runTests().catch(err => {
    console.error('\n❌ BATCH 13 SUITE FAILED:', err);
    process.exit(1);
});
