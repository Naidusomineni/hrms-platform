const http = require('http');

function apiCall(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const reqHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        if (payload) {
            reqHeaders['Content-Length'] = Buffer.byteLength(payload);
        }

        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api' + path,
            method: method,
            headers: reqHeaders
        };

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
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('   BATCH 1 REGRESSION & VERIFICATION TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`[PASS] ${message}`);
            passed++;
        } else {
            console.error(`[FAIL] ${message}`);
            failed++;
        }
    }

    try {
        // -----------------------------------------------------------------
        // TEST 1: SEC-008 — Session Revocation (Logout-All)
        // -----------------------------------------------------------------
        console.log('--- TEST 1: SEC-008 Session Revocation (Logout-All) ---');
        const loginRes = await apiCall('POST', '/v1/auth/login', {
            email: 'emp@hrms.com',
            password: 'Emp@123'
        });

        assert(loginRes.status === 200 && loginRes.data?.data?.accessToken, 'Login successful for emp@hrms.com');
        const initialAccessToken = loginRes.data.data.accessToken;
        const initialRefreshToken = loginRes.data.data.refreshToken;

        // Verify refresh token works before logout-all
        const testRefresh = await apiCall('POST', '/v1/auth/refresh', {
            refreshToken: initialRefreshToken
        });
        assert(testRefresh.status === 200 && testRefresh.data?.data?.accessToken, 'Token refresh works prior to logout-all');
        const activeRefreshToken = testRefresh.data.data.refreshToken;
        const currentAccessToken = testRefresh.data.data.accessToken;

        // Execute logout-all
        const logoutAllRes = await apiCall('POST', '/v1/auth/logout-all', {}, {
            Authorization: `Bearer ${currentAccessToken}`
        });
        assert(logoutAllRes.status === 200 && logoutAllRes.data?.message?.includes('invalidated'), 'POST /v1/auth/logout-all returned 200 success');

        // Verify that the active refresh token is now revoked and rejected
        const afterLogoutRefresh = await apiCall('POST', '/v1/auth/refresh', {
            refreshToken: activeRefreshToken
        });
        const refreshRejected = afterLogoutRefresh.status >= 400;
        assert(refreshRejected, `Subsequent refresh token attempt was REJECTED (HTTP ${afterLogoutRefresh.status})`);

        // -----------------------------------------------------------------
        // TEST 2: SEC-009 — Request State Machine & Approver Authorization
        // -----------------------------------------------------------------
        console.log('\n--- TEST 2: SEC-009 Request State Machine Constraints ---');
        
        // Re-login as emp@hrms.com
        const empLogin = await apiCall('POST', '/v1/auth/login', {
            email: 'emp@hrms.com',
            password: 'Emp@123'
        });
        const empToken = empLogin.data.data.accessToken;
        const empId = empLogin.data.data.employeeId;

        // Login as manager@hrms.com
        const mgrLogin = await apiCall('POST', '/v1/auth/login', {
            email: 'manager@hrms.com',
            password: 'Manager@123'
        });
        const mgrToken = mgrLogin.data.data.accessToken;

        // Create an employee request
        const createReqRes = await apiCall('POST', '/v1/requests', {
            employeeId: empId,
            requestType: 'WORK_FROM_HOME',
            title: 'Remote work for testing',
            description: 'Requesting WFH for performance testing'
        }, {
            Authorization: `Bearer ${empToken}`
        });
        if (createReqRes.status !== 201) {
            console.error('Create request failed with status:', createReqRes.status, 'data:', createReqRes.data);
        }
        assert(createReqRes.status === 201 && createReqRes.data?.data?.status === 'PENDING', 'Employee request created with status PENDING');
        const reqId = createReqRes.data.data.id;

        // 2a: Test invalid action string (e.g. "HACKED")
        const invalidActionRes = await apiCall('PUT', `/v1/requests/${reqId}/review?action=HACKED&comments=Malicious`, null, {
            Authorization: `Bearer ${mgrToken}`
        });
        const invalidActionRejected = invalidActionRes.status === 400 && JSON.stringify(invalidActionRes.data).includes('Allowed review actions');
        assert(invalidActionRejected, 'Invalid action "HACKED" rejected with 400 Bad Request');

        // 2b: Test unauthorized reviewer (emp@hrms.com with ROLE_EMPLOYEE trying to review)
        const unauthorizedReviewRes = await apiCall('PUT', `/v1/requests/${reqId}/review?action=APPROVED&comments=Self-approval`, null, {
            Authorization: `Bearer ${empToken}`
        });
        assert(unauthorizedReviewRes.status === 403, 'Unauthorized reviewer rejected with 403 Forbidden');

        // 2c: Legitimate approval by direct Manager
        const validReview = await apiCall('PUT', `/v1/requests/${reqId}/review?action=APPROVED&comments=Approved+by+Manager`, null, {
            Authorization: `Bearer ${mgrToken}`
        });
        assert(validReview.status === 200 && validReview.data?.data?.status === 'APPROVED', 'Authorized review transitioned status to APPROVED');

        // 2d: Re-reviewing terminal request rejected
        const terminalReviewRes = await apiCall('PUT', `/v1/requests/${reqId}/review?action=REJECTED&comments=Trying+to+reject`, null, {
            Authorization: `Bearer ${mgrToken}`
        });
        const terminalStateRejected = terminalReviewRes.status === 400 && JSON.stringify(terminalReviewRes.data).includes('terminal state');
        assert(terminalStateRejected, 'Re-reviewing finalized request rejected with 400 Bad Request (Terminal State)');

        console.log('\n====================================================');
        console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log('====================================================\n');

        if (failed > 0) {
            process.exit(1);
        }

    } catch (error) {
        console.error('Test execution failed with error:', error.message);
        process.exit(1);
    }
}

runTests();
