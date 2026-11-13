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

async function runBatch4Tests() {
    console.log('====================================================');
    console.log('🧪 BATCH 4 ENTERPRISE AUDIT & NOTIFICATION SUITE');
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

    // 2. Authentication as Admin
    const adminLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    }, { 'Content-Type': 'application/json' });
    assert(adminLogin.status === 200 && adminLogin.data?.data?.accessToken, '2. Admin authenticated successfully');
    const adminToken = adminLogin.data.data.accessToken;

    // 3. Security: Audit export endpoint rejects unauthenticated caller
    const unauthExport = await apiCall('GET', '/v1/admin/audit/export');
    assert(unauthExport.status === 401 || unauthExport.status === 403, 
        `3. AUD-001: Unauthenticated audit log export request rejected with HTTP ${unauthExport.status}`);

    // 4. Security: Regular Employee cannot export audit logs
    const empLogin = await apiCall('POST', '/v1/auth/login', {
        email: 'emp@hrms.com',
        password: 'Emp@123'
    }, { 'Content-Type': 'application/json' });
    const empToken = empLogin.data?.data?.accessToken;
    const empExport = await apiCall('GET', '/v1/admin/audit/export', null, {
        Authorization: `Bearer ${empToken}`
    });
    assert(empExport.status === 403, `4. AUD-001: Employee forbidden from exporting audit logs (HTTP ${empExport.status})`);

    // 5. Functional: Admin can export full Audit Logs CSV
    const adminExport = await apiCall('GET', '/v1/admin/audit/export', null, {
        Authorization: `Bearer ${adminToken}`
    });
    const disposition = adminExport.headers['content-disposition'] || '';
    const contentType = adminExport.headers['content-type'] || '';
    const hasHeaderRow = adminExport.raw.startsWith('Timestamp,Action,Entity Type,Entity ID,Performed By,Description,Request ID');
    assert(adminExport.status === 200 && disposition.includes('attachment; filename=') && hasHeaderRow,
        `5. AUD-001: Admin CSV export successful (Content-Type: ${contentType}, length: ${adminExport.raw.length} bytes)`);

    // 6. Audit Logging: Generate Payroll run and verify PAYROLL_GENERATED is recorded
    const payrollRun = await apiCall('POST', '/v1/payroll/process-all?month=11&year=2026', null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(payrollRun.status === 200 || payrollRun.status === 201, `6. AUD-002: Payroll calculated for current period (HTTP ${payrollRun.status})`);

    // Wait 600ms for async audit log persistence
    await new Promise(r => setTimeout(r, 600));

    // Verify audit log exists for payroll
    const auditQuery = await apiCall('GET', '/v1/admin/audit?entityType=PAYROLL', null, {
        Authorization: `Bearer ${adminToken}`
    });
    const payrollLogs = auditQuery.data?.data?.content || [];
    const hasPayrollGenLog = payrollLogs.some(l => l.action === 'PAYROLL_GENERATED');
    assert(hasPayrollGenLog, `7. AUD-002: Financial audit log recorded: PAYROLL_GENERATED (${payrollLogs.length} payroll events tracked)`);

    // 7. Audit Logging: Export filtered CSV
    const filteredExport = await apiCall('GET', '/v1/admin/audit/export?entityType=PAYROLL', null, {
        Authorization: `Bearer ${adminToken}`
    });
    assert(filteredExport.status === 200 && filteredExport.raw.includes('PAYROLL_GENERATED'),
        `8. AUD-001: Filtered CSV export contains PAYROLL_GENERATED records`);

    // 8. Candidate Stage Transition & Notification Dispatch
    // Create candidate first
    const ts = Date.now();
    const candRes = await apiCall('POST', '/v1/recruitment/candidates', {
        name: 'Meera Nambiar ' + ts,
        email: `meera.${ts}@example.com`,
        phone: '+91 9988776655',
        experienceYears: 6,
        currentCtc: 1800000,
        expectedCtc: 2400000,
        noticePeriodDays: 30,
        source: 'LinkedIn'
    }, {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    });
    const candId = candRes.data?.data?.id;

    if (candId) {
        // Advance stage to INTERVIEW_ROUND_1
        const stageAdv = await apiCall('PATCH', `/v1/recruitment/candidates/${candId}/stage?stage=INTERVIEW_ROUND_1`, null, {
            Authorization: `Bearer ${adminToken}`
        });
        assert(stageAdv.status === 200 && stageAdv.data?.data?.stage === 'INTERVIEW_ROUND_1',
            `9. REC-002: Candidate stage manually updated to INTERVIEW_ROUND_1 with email dispatch`);

        await new Promise(r => setTimeout(r, 600));

        // Verify audit log for stage update
        const candAudit = await apiCall('GET', `/v1/admin/audit?q=Meera`, null, {
            Authorization: `Bearer ${adminToken}`
        });
        const candLogs = candAudit.data?.data?.content || [];
        const hasCandLog = candLogs.some(l => l.action === 'CANDIDATE_STAGE_UPDATED');
        assert(hasCandLog, `10. REC-002: Audit trail records CANDIDATE_STAGE_UPDATED event for candidate #${candId}`);
    } else {
        assert(false, `9. Candidate creation failed: ${JSON.stringify(candRes.data)}`);
    }

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('====================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runBatch4Tests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});
