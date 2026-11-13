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
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

async function testBulkImport() {
    console.log('====================================================');
    console.log('       TESTING EMPLOYEE BULK IMPORT API');
    console.log('====================================================\n');

    // 1. Login as Admin
    const login = await apiCall('POST', '/v1/auth/login', {
        email: 'admin@hrms.com',
        password: 'Admin@123'
    }, { 'Content-Type': 'application/json' });

    if (login.status !== 200) {
        console.error('Failed to log in as admin:', login.data);
        process.exit(1);
    }
    const token = login.data.data.accessToken;
    console.log('✅ Admin logged in successfully');

    // 2. Test Download Template
    console.log('\n--- 1. Testing GET /v1/employees/bulk-import/template ---');
    const templateRes = await apiCall('GET', '/v1/employees/bulk-import/template', null, {
        Authorization: `Bearer ${token}`
    });
    console.log('Status:', templateRes.status);
    console.log('Content-Type:', templateRes.headers['content-type']);
    console.log('Template Header Preview:\n' + templateRes.raw.split('\n')[0]);
    if (templateRes.status === 200 && templateRes.raw.includes('first_name,last_name,email')) {
        console.log('✅ Template download test PASSED!');
    } else {
        console.error('❌ Template download FAILED');
        process.exit(1);
    }

    // 3. Test Bulk Upload with Multipart/form-data
    console.log('\n--- 2. Testing POST /v1/employees/bulk-import ---');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const testCsv = 
`first_name,last_name,email,phone_number,department,designation,date_of_joining,salary,employment_status
Siddharth,Verma,siddharth.verma@eoxys.com,+91 9876543290,Engineering,Backend Lead,2026-06-01,95000,FULL_TIME
Ananya,Deshmukh,ananya.deshmukh@eoxys.com,+91 9876543291,Engineering,QA Lead,2026-06-15,80000,FULL_TIME
Invalid,,admin@hrms.com,+91 9876543292,Engineering,Tester,2026-06-15,50000,PROBATION
`;

    let body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="employees.csv"\r\nContent-Type: text/csv\r\n\r\n`),
        Buffer.from(testCsv),
        Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadRes = await apiCall('POST', '/v1/employees/bulk-import', body, {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
    });

    console.log('Upload Status:', uploadRes.status);
    console.log('Upload Result:', JSON.stringify(uploadRes.data, null, 2));

    if (uploadRes.status === 200 && uploadRes.data?.data) {
        const res = uploadRes.data.data;
        console.log(`Total Rows: ${res.totalRows}, Success: ${res.successCount}, Failures: ${res.failureCount}`);
        if (res.successCount === 2 && res.failureCount === 1) {
            console.log('✅ Bulk Import Test PASSED with accurate duplicate detection and row accounting!');
        } else {
            console.error('❌ Bulk Import unexpected counts');
        }
    } else {
        console.error('❌ Bulk Import upload failed');
        process.exit(1);
    }
}

testBulkImport().catch(console.error);

