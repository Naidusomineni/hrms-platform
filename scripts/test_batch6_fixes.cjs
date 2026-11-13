const http = require('http');

function apiCall(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body ? (Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))) : null;
        const reqHeaders = { ...headers };
        if (payload) {
            reqHeaders['Content-Length'] = payload.length;
        }

        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api' + path,
            method: method,
            headers: reqHeaders
        };

        const req = http.request(options, (res) => {
            let resData = [];
            res.on('data', chunk => resData.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(resData);
                const text = buffer.toString('utf8');
                let parsed = null;
                try {
                    parsed = JSON.parse(text);
                } catch (e) {
                    parsed = text;
                }
                resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: text });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runBatch6Tests() {
    console.log('====================================================');
    console.log('🧪 BATCH 6 CROSS-MODULE BOLA/IDOR & ROLE BOUNDARY SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(cond, msg) {
        if (cond) {
            console.log(`✅ [PASS] ${msg}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${msg}`);
            failed++;
        }
    }

    // 1. Health check
    const health = await apiCall('GET', '/actuator/health');
    assert(health.status === 200 && health.data?.status === 'UP', '1. System Health Actuator is UP');

    // 2. Authenticate Admin (Elevated) and Standard Employee (Non-elevated)
    const adminLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    }, { 'Content-Type': 'application/json' });
    assert(adminLogin.status === 200 && adminLogin.data?.data?.accessToken, '2. Admin authenticated successfully');
    const adminToken = adminLogin.data.data.accessToken;

    const empLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'emp@hrms.com',
        password: 'Emp@123'
    }, { 'Content-Type': 'application/json' });
    assert(empLogin.status === 200 && empLogin.data?.data?.accessToken, '3. Standard Employee authenticated successfully');
    const empToken = empLogin.data.data.accessToken;
    const empId = empLogin.data.data.employeeId || 2; // Standard employee id

    // Manager / Other employee id: employee #1 is Priya Sharma (manager/admin) or another employee
    const targetOtherEmpId = 1;

    // 3. Test Performance Module: getAllReviews
    // Admin should succeed (200)
    const adminReviews = await apiCall('GET', '/v1/performance/reviews', null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(adminReviews.status === 200, '4. Admin access to /v1/performance/reviews granted (200 OK)');

    // Employee should be blocked (403 Forbidden)
    const empReviews = await apiCall('GET', '/v1/performance/reviews', null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empReviews.status === 403, `5. BOLA-001: Employee access to /v1/performance/reviews blocked (HTTP ${empReviews.status} Forbidden)`);

    // 4. Test Performance Module: getReviewsForEmployee IDOR
    // Employee viewing own reviews: 200 OK
    const empOwnReviews = await apiCall('GET', `/v1/performance/reviews/employee/${empId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empOwnReviews.status === 200, '6. Employee viewing own performance reviews allowed (200 OK)');

    // Employee viewing OTHER employee reviews: 403 Forbidden
    const empOtherReviews = await apiCall('GET', `/v1/performance/reviews/employee/${targetOtherEmpId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empOtherReviews.status === 403, `7. BOLA-001: Employee attempting to view other employee appraisal blocked (HTTP ${empOtherReviews.status} Forbidden)`);

    // 5. Test Performance Module: getGoalsForEmployee IDOR
    const empOtherGoals = await apiCall('GET', `/v1/performance/goals/employee/${targetOtherEmpId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empOtherGoals.status === 403, `8. BOLA-001: Employee attempting to view other employee OKR goals blocked (HTTP ${empOtherGoals.status} Forbidden)`);

    // 6. Test Helpdesk Module: getAllTickets
    // Admin should succeed (200)
    const adminTickets = await apiCall('GET', '/v1/helpdesk/tickets', null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(adminTickets.status === 200, '9. Admin access to all helpdesk SLA tickets granted (200 OK)');

    // Employee should be blocked (403 Forbidden)
    const empTickets = await apiCall('GET', '/v1/helpdesk/tickets', null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empTickets.status === 403, `10. BOLA-002: Employee access to global helpdesk ticket queue blocked (HTTP ${empTickets.status} Forbidden)`);

    // 7. Test Helpdesk Module: getMyTickets IDOR
    // Employee querying own tickets: 200 OK
    const empOwnTickets = await apiCall('GET', `/v1/helpdesk/tickets/my?employeeId=${empId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empOwnTickets.status === 200, '11. Employee querying own support tickets allowed (200 OK)');

    // Employee spoofing other employeeId on /my: 403 Forbidden
    const empSpoofTickets = await apiCall('GET', `/v1/helpdesk/tickets/my?employeeId=${targetOtherEmpId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empSpoofTickets.status === 403, `12. BOLA-002: Employee querying tickets of other employee blocked (HTTP ${empSpoofTickets.status} Forbidden)`);

    // 8. Test Asset Module: getAssets Inventory
    const adminAssets = await apiCall('GET', '/v1/assets', null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(adminAssets.status === 200, '13. Admin access to full hardware asset inventory granted (200 OK)');

    const empAssets = await apiCall('GET', '/v1/assets', null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empAssets.status === 403, `14. SEC-010: Employee access to full corporate asset inventory blocked (HTTP ${empAssets.status} Forbidden)`);

    // 9. Test Asset Module: getEmployeeAssets IDOR
    const empOtherAssets = await apiCall('GET', `/v1/assets/employee/${targetOtherEmpId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empOtherAssets.status === 403, `15. SEC-010: Employee attempting to view another employee assigned assets blocked (HTTP ${empOtherAssets.status} Forbidden)`);

    // 10. Test Document Vault: letters/generate
    const empLetter = await apiCall('POST', '/v1/documents/letters/generate', {
        employeeId: empId,
        letterType: 'EXPERIENCE',
        purpose: 'Visa application'
    }, {
        Authorization: `Bearer ${empToken}`,
        'Content-Type': 'application/json'
    });
    assert(empLetter.status === 403, `16. SEC-004: Employee unauthorized generation of HR letters blocked (HTTP ${empLetter.status} Forbidden)`);

    // 11. Test Expense Module: getMyClaims IDOR
    const empSpoofClaims = await apiCall('GET', `/v1/expenses/claims/my?employeeId=${targetOtherEmpId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empSpoofClaims.status === 403, `17. BOLA-003: Employee querying expense claims of other employee blocked (HTTP ${empSpoofClaims.status} Forbidden)`);

    // 12. Test Leave Module: getForEmployee IDOR
    const empSpoofLeaves = await apiCall('GET', `/v1/leaves/employee/${targetOtherEmpId}`, null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empSpoofLeaves.status === 403, `18. BOLA-004: Employee querying leave history of other employee blocked (HTTP ${empSpoofLeaves.status} Forbidden)`);

    // 13. Test Leave Module: apply on behalf of other employee
    const empSpoofApply = await apiCall('POST', `/v1/leaves/apply/${targetOtherEmpId}`, {
        startDate: '2026-11-20',
        endDate: '2026-11-21',
        leaveType: 'CASUAL',
        reason: 'Spoofed request'
    }, {
        Authorization: `Bearer ${empToken}`,
        'Content-Type': 'application/json'
    });
    assert(empSpoofApply.status === 403, `19. BOLA-004: Employee applying for leave on behalf of other employee blocked (HTTP ${empSpoofApply.status} Forbidden)`);

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('====================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runBatch6Tests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});
