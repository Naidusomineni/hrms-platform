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
    console.log('🚀 HRMS BATCH 10 VERIFICATION SUITE');
    console.log('   In-App Notification Hub, Unread Counters & Event Dispatchers');
    console.log('================================================================\n');

    // ── 1. Authentication ──
    console.log('--- 1. Authentication for Roles ---');
    const adminLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    });
    assert(adminLogin.statusCode === 200, 'Admin login succeeded');
    const adminToken = adminLogin.body?.data?.accessToken;
    const adminUserId = adminLogin.body?.data?.userId;
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    const empLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'emp@hrms.com',
        password: 'Emp@123'
    });
    assert(empLogin.statusCode === 200, 'Employee login succeeded');
    const empToken = empLogin.body?.data?.accessToken;
    const empUserId = empLogin.body?.data?.userId;
    const empId = empLogin.body?.data?.employeeId;
    const empHeaders = { 'Authorization': `Bearer ${empToken}` };

    const managerLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'manager@hrms.com',
        password: 'Manager@123'
    });
    assert(managerLogin.statusCode === 200, 'Manager login succeeded');
    const managerToken = managerLogin.body?.data?.accessToken;
    const managerHeaders = { 'Authorization': `Bearer ${managerToken}` };

    // ── 2. Self-Service Notification Endpoints ──
    console.log('\n--- 2. NOTIF-001: Self-Service Endpoints ---');
    const myNotifs = await apiCall('GET', '/v1/notifications', null, empHeaders);
    assert(myNotifs.statusCode === 200, 'GET /v1/notifications (self-service) returns 200 OK');
    assert(myNotifs.body?.data?.content !== undefined, 'Notifications returned as paged array');

    const unreadRes = await apiCall('GET', '/v1/notifications/unread-count', null, empHeaders);
    assert(unreadRes.statusCode === 200, 'GET /v1/notifications/unread-count (self-service) returns 200 OK');
    const initialUnreadCount = Number(unreadRes.body?.data);
    assert(!isNaN(initialUnreadCount), `Unread count is a valid number (current: ${initialUnreadCount})`);

    const markAllRes = await apiCall('PUT', '/v1/notifications/mark-all-read', null, empHeaders);
    assert(markAllRes.statusCode === 200, 'PUT /v1/notifications/mark-all-read (self-service) returns 200 OK');

    const unreadAfterMarkAll = await apiCall('GET', '/v1/notifications/unread-count', null, empHeaders);
    assert(Number(unreadAfterMarkAll.body?.data) === 0, 'Unread count is 0 after mark-all-read');

    // ── 3. IDOR / BOLA Boundary Enforcement ──
    console.log('\n--- 3. BOLA / IDOR Security Boundaries ---');
    // Employee attempting to access Admin notifications
    const bolaNotifRes = await apiCall('GET', `/v1/notifications/user/${adminUserId}`, null, empHeaders);
    assert(bolaNotifRes.statusCode === 403, 'BOLA: Employee cannot access Admin notifications (/user/{adminUserId} -> 403 Forbidden)');

    const bolaUnreadRes = await apiCall('GET', `/v1/notifications/user/${adminUserId}/unread-count`, null, empHeaders);
    assert(bolaUnreadRes.statusCode === 403, 'BOLA: Employee cannot access Admin unread count -> 403 Forbidden');

    const bolaMarkAllRes = await apiCall('PUT', `/v1/notifications/user/${adminUserId}/mark-all-read`, null, empHeaders);
    assert(bolaMarkAllRes.statusCode === 403, 'BOLA: Employee cannot mark all read for Admin -> 403 Forbidden');

    // Admin accessing employee notifications (permitted)
    const adminAccessEmpNotifs = await apiCall('GET', `/v1/notifications/user/${empUserId}`, null, adminHeaders);
    assert(adminAccessEmpNotifs.statusCode === 200, 'Admin can view employee notifications (elevated access permitted)');

    // ── 4. NOTIF-002: Leave Event Dispatching ──
    console.log('\n--- 4. NOTIF-002: Leave Event Dispatching ---');
    assert(!!empId, `Resolved employee ID #${empId} for emp@hrms.com`);

    // Apply for leave as employee in Dec 2026
    const day = String(10 + Math.floor(Math.random() * 18)).padStart(2, '0');
    const leaveDate = `2026-12-${day}`;
    const leaveRes = await apiCall('POST', `/v1/leaves/apply/${empId}`, {
        leaveType: 'CASUAL',
        startDate: leaveDate,
        endDate: leaveDate,
        reason: 'Batch 10 automated notification test leave'
    }, empHeaders);
    assert(leaveRes.statusCode === 201, 'Leave application submitted successfully');
    const leaveId = leaveRes.body?.data?.id;

    // Review leave as Manager (Approve)
    const reviewRes = await apiCall('PUT', `/v1/leaves/${leaveId}/review`, {
        action: 'APPROVED',
        comments: 'Approved in Batch 10 verification test'
    }, managerHeaders);
    assert(reviewRes.statusCode === 200, 'Leave reviewed and approved by Manager');

    // Verify Employee received LEAVE_APPROVED notification
    const empNotifsAfterLeave = await apiCall('GET', '/v1/notifications', null, empHeaders);
    assert(empNotifsAfterLeave.statusCode === 200, 'Fetched employee notifications');
    const notifs = empNotifsAfterLeave.body?.data?.content || [];
    const leaveNotif = notifs.find(n => n.type === 'LEAVE_APPROVED' && n.title?.includes('Leave Request APPROVED'));
    assert(!!leaveNotif, `Employee received LEAVE_APPROVED notification: "${leaveNotif?.title}"`);

    // Verify unread count is >= 1
    const unreadCountAfterLeave = await apiCall('GET', '/v1/notifications/unread-count', null, empHeaders);
    assert(Number(unreadCountAfterLeave.body?.data) >= 1, `Unread count reflects new notification (count: ${unreadCountAfterLeave.body?.data})`);

    // ── 5. Notification Single Mark Read & Ownership Security ──
    console.log('\n--- 5. Single Notification Mark-Read & Ownership Protection ---');
    // Manager attempting to mark employee's notification as read -> 403 Forbidden
    const crossUserMarkRead = await apiCall('PUT', `/v1/notifications/${leaveNotif.id}/read`, null, managerHeaders);
    assert(crossUserMarkRead.statusCode === 403, 'Cross-user mark-read blocked with 403 Forbidden');

    // Employee marking their own notification as read -> 200 OK
    const ownMarkRead = await apiCall('PUT', `/v1/notifications/${leaveNotif.id}/read`, null, empHeaders);
    assert(ownMarkRead.statusCode === 200, 'Employee marked their own notification as read (200 OK)');

    // ── 6. NOTIF-002: IT Asset Allocation Event Dispatching ──
    console.log('\n--- 6. NOTIF-002: IT Asset Allocation Event Dispatching ---');
    // Create new test asset
    const newAsset = await apiCall('POST', '/v1/assets', {
        assetTag: `AST-B10-${Date.now().toString().slice(-4)}`,
        category: 'LAPTOP',
        brand: 'Apple',
        model: 'MacBook Pro M3 Max 16"',
        serialNumber: `SN-B10-${Date.now()}`,
        status: 'AVAILABLE'
    }, adminHeaders);
    assert(newAsset.statusCode === 201, 'Test IT asset created');
    const assetId = newAsset.body?.data?.id;

    // Allocate to employee
    const allocRes = await apiCall('POST', `/v1/assets/${assetId}/allocate?employeeId=${empId}&notes=Assigned+for+engineering+project`, null, adminHeaders);
    assert(allocRes.statusCode === 200, 'Asset allocated to employee');
    const allocId = allocRes.body?.data?.id;

    // Verify employee received ASSET_ASSIGNED notification
    const empNotifsAfterAsset = await apiCall('GET', '/v1/notifications', null, empHeaders);
    const assetNotif = (empNotifsAfterAsset.body?.data?.content || []).find(n => n.type === 'ASSET_ASSIGNED');
    assert(!!assetNotif, `Employee received ASSET_ASSIGNED notification: "${assetNotif?.title}"`);

    // Return asset
    const returnRes = await apiCall('POST', `/v1/assets/allocations/${allocId}/return?notes=Returned+in+good+condition`, null, adminHeaders);
    assert(returnRes.statusCode === 200, 'Asset returned');

    // Verify employee received ASSET_RETURNED notification
    const empNotifsAfterReturn = await apiCall('GET', '/v1/notifications', null, empHeaders);
    const returnNotif = (empNotifsAfterReturn.body?.data?.content || []).find(n => n.type === 'ASSET_RETURNED');
    assert(!!returnNotif, `Employee received ASSET_RETURNED notification: "${returnNotif?.title}"`);

    // ── 7. NOTIF-002: Expense Claim Event Dispatching ──
    console.log('\n--- 7. NOTIF-002: Expense Claim Event Dispatching ---');
    const claimRes = await apiCall('POST', `/v1/expenses/claims?employeeId=${empId}`, {
        title: 'Batch 10 Client Visit Taxi',
        category: 'TRAVEL',
        amount: 1500.00,
        expenseDate: new Date().toISOString().slice(0, 10),
        description: 'Client travel for verification suite'
    }, empHeaders);
    assert(claimRes.statusCode === 200 || claimRes.statusCode === 201, 'Expense claim submitted');
    const claimId = claimRes.body?.data?.id;

    // Manager reviews and approves expense claim
    const expenseReviewRes = await apiCall('PUT', `/v1/expenses/claims/${claimId}/manager-review`, {
        action: 'APPROVE',
        remarks: 'Approved in Batch 10 automated test'
    }, managerHeaders);
    assert(expenseReviewRes.statusCode === 200, 'Expense claim approved by manager');

    // Verify employee received EXPENSE_APPROVED notification
    const empNotifsAfterExpense = await apiCall('GET', '/v1/notifications', null, empHeaders);
    const expenseNotif = (empNotifsAfterExpense.body?.data?.content || []).find(n => n.type === 'EXPENSE_APPROVED');
    assert(!!expenseNotif, `Employee received EXPENSE_APPROVED notification: "${expenseNotif?.title}"`);

    console.log('\n================================================================');
    console.log(`🎉 BATCH 10 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('================================================================\n');
}

runTests().catch(err => {
    console.error('\n❌ BATCH 10 SUITE FAILED:', err);
    process.exit(1);
});
