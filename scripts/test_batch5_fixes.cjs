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

async function runBatch5Tests() {
    console.log('====================================================');
    console.log('🧪 BATCH 5 ADVANCED OFFBOARDING & F&F AUDIT SUITE');
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

    // 1. System Health
    const health = await apiCall('GET', '/actuator/health');
    assert(health.status === 200 && health.data?.status === 'UP', '1. System Health Actuator is UP');

    // 2. Authenticate Admin and HR
    const adminLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    }, { 'Content-Type': 'application/json' });
    assert(adminLogin.status === 200 && adminLogin.data?.data?.accessToken, '2. Admin authenticated successfully');
    const adminToken = adminLogin.data.data.accessToken;

    // 3. Create a dedicated employee for this offboarding lifecycle test
    const ts = Date.now();
    const newEmpRes = await apiCall('POST', '/v1/employees', {
        firstName: 'Devendra',
        lastName: 'Joshi',
        email: `devendra.${ts}@eoxys.com`,
        phoneNumber: '919123456789',
        password: 'Password@123',
        departmentId: 1, // Engineering
        designation: 'Senior Infrastructure Engineer',
        dateOfJoining: '2021-03-01', // 5+ years for gratuity eligibility
        salary: 120000,
        employmentStatus: 'ACTIVE'
    }, {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    });
    assert(newEmpRes.status === 201 || newEmpRes.status === 200, '3. Test employee created (Devendra Joshi, 5+ yrs tenure)');
    const testEmp = newEmpRes.data?.data;
    const testEmpId = testEmp?.id;

    // 4. Allocate an IT Hardware Asset to this employee
    const assetRes = await apiCall('POST', '/v1/assets', {
        assetTag: `AST-M3-${ts.toString().slice(-4)}`,
        category: 'LAPTOP',
        brand: 'Apple',
        model: 'MacBook Pro M3 Max 16-inch',
        serialNumber: `C02G${ts.toString().slice(-6)}`,
        cost: 285000,
        conditionStatus: 'EXCELLENT'
    }, {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    });
    const assetId = assetRes.data?.data?.id;

    const allocRes = await apiCall('POST', `/v1/assets/${assetId}/allocate?employeeId=${testEmpId}&notes=Engineering+Workstation`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(allocRes.status === 200 && allocRes.data?.data?.allocationStatus === 'ACTIVE',
        `4. IT Asset #${assetId} (${assetRes.data?.data?.assetTag}) actively allocated to Devendra`);

    // Verify employee has 1 active asset
    const myAssetsRes = await apiCall('GET', `/v1/assets/employee/${testEmpId}`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(myAssetsRes.data?.data?.length === 1, `5. Employee asset custody confirmed: 1 active physical asset assigned`);

    // 5. Test Resignation Submission & Automatic Checkpoint Provisioning
    const sepRes = await apiCall('POST', '/v1/offboarding/separations', {
        employeeId: testEmpId,
        resignationDate: '2026-11-13',
        requestedLastWorkingDay: '2026-12-31',
        reason: 'Pursuing higher studies abroad',
        separationType: 'RESIGNATION'
    }, {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    });
    assert(sepRes.status === 201 && sepRes.data?.data?.clearances?.length === 4,
        `6. OFF-001: Separation submitted with 4 departmental NOC checkpoints (IT, Finance, HR, Manager)`);
    const sepId = sepRes.data?.data?.id;

    // 6. Test Resignation Withdrawal Workflow
    const withdrawRes = await apiCall('PUT', `/v1/offboarding/separations/${sepId}/withdraw`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(withdrawRes.status === 200 && withdrawRes.data?.data?.status === 'WITHDRAWN',
        `7. OFF-001: Resignation successfully withdrawn, clearances cancelled`);

    // 7. Re-submit fresh resignation to test complete clearance & F&F settlement
    const sepRes2 = await apiCall('POST', '/v1/offboarding/separations', {
        employeeId: testEmpId,
        resignationDate: '2026-11-13',
        requestedLastWorkingDay: '2026-11-30',
        reason: 'Career transition',
        separationType: 'RESIGNATION'
    }, {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    });
    const sep2Id = sepRes2.data?.data?.id;
    const clearances = sepRes2.data?.data?.clearances || [];

    // Review & Approve Resignation
    const reviewRes = await apiCall('PUT', `/v1/offboarding/separations/${sep2Id}/review?action=APPROVED&approvedLwd=2026-11-30&comments=Approved+relieving`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(reviewRes.status === 200 && reviewRes.data?.data?.status === 'CLEARANCE_PENDING',
        `8. Separation approved by management -> status transitioned to CLEARANCE_PENDING`);

    // 8. Test IT Hardware Clearance & Asset Auto-Surrender
    const itClearance = clearances.find(c => c.departmentType === 'IT_ASSETS');
    const itClearRes = await apiCall('PUT', `/v1/offboarding/clearances/${itClearance.id}?status=CLEARED&pendingDues=0&remarks=All+hardware+safely+returned`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(itClearRes.status === 200 && itClearRes.data?.data?.status === 'CLEARED',
        `9. OFF-002: IT Assets NOC checkpoint cleared`);

    // Verify employee assets automatically reconciled to RETURNED and asset is now AVAILABLE
    const myAssetsAfterRes = await apiCall('GET', `/v1/assets/employee/${testEmpId}`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(myAssetsAfterRes.data?.data?.length === 0,
        `10. OFF-002: Auto-reconciliation verified: Zero remaining active asset allocations in custody`);

    // Clear remaining clearances (FINANCE, HR_ADMIN, MANAGER)
    for (const c of clearances.filter(cl => cl.departmentType !== 'IT_ASSETS')) {
        await apiCall('PUT', `/v1/offboarding/clearances/${c.id}?status=CLEARED&pendingDues=0&remarks=Clearance+NOC+granted`, null, {
            Authorization: `Bearer ${adminToken}`
        });
    }

    // Verify separation is now CLEARANCE_COMPLETED
    const sepDetails = await apiCall('GET', `/v1/offboarding/separations/${sep2Id}`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(sepDetails.data?.data?.status === 'CLEARANCE_COMPLETED',
        `11. All 4 department NOCs granted -> status transitioned to CLEARANCE_COMPLETED`);

    // 9. Test F&F Settlement Mathematical Computation (Tenure >= 5 yrs => Gratuity calculated)
    const calcRes = await apiCall('POST', `/v1/offboarding/settlements/calculate?separationId=${sep2Id}`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    const settlement = calcRes.data?.data;
    const gratuityEligible = settlement?.gratuityAmount > 0;
    const netPositive = settlement?.netPayableAmount > 0;
    assert(calcRes.status === 200 && gratuityEligible && netPositive,
        `12. F&F Settlement auto-computed: Gratuity=₹${settlement?.gratuityAmount}, Net Payable=₹${settlement?.netPayableAmount}`);

    // 10. Disburse F&F Settlement & Verify SEC-015 User Deactivation
    const disburseRes = await apiCall('POST', '/v1/offboarding/settlements?disburse=true', settlement, {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    });
    assert(disburseRes.status === 200 && disburseRes.data?.data?.status === 'DISBURSED',
        `13. F&F Settlement finalized and marked DISBURSED`);

    // Verify employee status is now TERMINATED
    const empTermRes = await apiCall('GET', `/v1/employees/${testEmpId}`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(empTermRes.data?.data?.employmentStatus === 'TERMINATED',
        `14. SEC-015: Employee master record transitioned to TERMINATED`);

    // Verify User account is deactivated (cannot login)
    const termLogin = await apiCall('POST', '/v1/auth/login', {
        email: `devendra.${ts}@eoxys.com`,
        password: 'Password@123'
    }, { 'Content-Type': 'application/json' });
    assert(termLogin.status === 401 || termLogin.status === 403,
        `15. SEC-015: Terminated employee user account access disabled (HTTP ${termLogin.status})`);

    // 11. Audit Trail Verification
    await new Promise(r => setTimeout(r, 600));
    const auditRes = await apiCall('GET', `/v1/admin/audit?q=Devendra`, null, {
        Authorization: `Bearer ${adminToken}`
    });
    const devLogs = auditRes.data?.data?.content || [];
    const hasDisbursedLog = devLogs.some(l => l.action === 'SETTLEMENT_DISBURSED');
    const hasWithdrawnLog = devLogs.some(l => l.action === 'SEPARATION_WITHDRAWN');
    assert(hasDisbursedLog && hasWithdrawnLog,
        `16. AUD-003: Immutable audit logs recorded: SETTLEMENT_DISBURSED and SEPARATION_WITHDRAWN (${devLogs.length} events logged)`);

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('====================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runBatch5Tests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});
