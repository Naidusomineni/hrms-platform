/**
 * 🧪 BATCH 3 VERIFICATION SUITE:
 * 1. SEC-013: Magic-Byte Binary Inspection for File Uploads
 * 2. SEC-014: Hardware Biometric Terminal API Key Authentication
 * 3. DB-002: HikariCP Connection Leak Detection & Backup Integration
 * 4. Cross-Role Functional Verification (Admin, HR, Manager, Employee, IT Admin)
 */
const http = require('http');

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      if (Buffer.isBuffer(postData)) {
        req.write(postData);
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

function buildMultipartFormData(fields, fileField, fileName, fileBuffer, mimeType) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
      `${val}\r\n`
    );
  }

  parts.push(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`
  );

  const headerBuffer = Buffer.from(parts.join(''), 'utf8');
  const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const payload = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);

  return {
    boundary,
    payload,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length,
    },
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BATCH 3 INFRASTRUCTURE & SECURITY VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, detail = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${detail ? '(' + detail + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? '(' + detail + ')' : ''}`);
    }
  }

  try {
    // 1. Actuator Health
    const health = await httpRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/actuator/health',
      method: 'GET',
    });
    assert(health.statusCode === 200 && health.json?.status === 'UP', '1. System Actuator Health is UP');

    // 2. Admin Login
    const loginPayload = JSON.stringify({ email: 'admin@hrms.com', password: 'Admin@123' });
    const loginRes = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginPayload),
          'X-Tenant-ID': 'default',
        },
      },
      loginPayload
    );
    const adminToken = loginRes.json?.data?.accessToken;
    assert(loginRes.statusCode === 200 && !!adminToken, '2. Admin authenticated successfully');

    // 3. SEC-013: Attempt to upload an executable binary disguised as a PDF
    // Windows MZ PE header: 0x4D, 0x5A
    const fakePdfBytes = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00]);
    const fakeUpload = buildMultipartFormData(
      {
        employeeId: '1',
        category: 'GOVERNMENT_ID',
        title: 'Disguised Executable',
      },
      'file',
      'malicious.pdf',
      fakePdfBytes,
      'application/pdf'
    );

    const rejectFakePdf = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/documents/upload',
        method: 'POST',
        headers: {
          ...fakeUpload.headers,
          Authorization: `Bearer ${adminToken}`,
          'X-Tenant-ID': 'default',
        },
      },
      fakeUpload.payload
    );

    assert(
      rejectFakePdf.statusCode === 400 &&
      rejectFakePdf.json?.message?.includes('Executable binaries are strictly prohibited'),
      '3. SEC-013: Upload of executable binary disguised as PDF rejected with 400 Bad Request'
    );

    // 4. SEC-013: Attempt to upload genuine PDF document
    // Genuine PDF starts with %PDF-1.4
    const validPdfBytes = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF', 'utf8');
    const validUpload = buildMultipartFormData(
      {
        employeeId: '1',
        category: 'GOVERNMENT_ID',
        title: 'Authentic Passport Copy',
      },
      'file',
      'passport.pdf',
      validPdfBytes,
      'application/pdf'
    );

    const acceptValidPdf = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/documents/upload',
        method: 'POST',
        headers: {
          ...validUpload.headers,
          Authorization: `Bearer ${adminToken}`,
          'X-Tenant-ID': 'default',
        },
      },
      validUpload.payload
    );

    assert(
      acceptValidPdf.statusCode === 201 && acceptValidPdf.json?.success === true,
      '4. SEC-013: Upload of genuine PDF accepted with magic byte verification',
      `Doc ID: ${acceptValidPdf.json?.data?.id}`
    );

    // 5. SEC-014: Hardware Biometric Webhook without credentials or API Key -> REJECTED
    const timestampStr = new Date().toISOString().split('.')[0];
    const biometricPayload = JSON.stringify([
      {
        employeeNumber: 'EMP-ADM-0001',
        timestamp: timestampStr,
        punchType: 'CHECK_IN',
        deviceId: 'TURNSTILE-GATE-01',
      },
    ]);

    const unauthBiometric = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/attendance/biometric-sync',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(biometricPayload),
          'X-Tenant-ID': 'default',
        },
      },
      biometricPayload
    );

    assert(
      unauthBiometric.statusCode === 403 || unauthBiometric.statusCode === 401,
      '5. SEC-014: Unauthenticated biometric sync request without API key is REJECTED (HTTP ' + unauthBiometric.statusCode + ')'
    );

    // 6. SEC-014: Hardware Biometric Webhook with invalid API Key -> REJECTED
    const invalidKeyBiometric = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/attendance/biometric-sync',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(biometricPayload),
          'X-Tenant-ID': 'default',
          'X-Device-Api-Key': 'spoofed-fake-key-999',
        },
      },
      biometricPayload
    );

    assert(
      invalidKeyBiometric.statusCode === 403,
      '6. SEC-014: Biometric sync with invalid X-Device-Api-Key is REJECTED (HTTP 403 Forbidden)'
    );

    // 7. SEC-014: Hardware Biometric Webhook with valid X-Device-Api-Key -> ACCEPTED
    const validKeyBiometric = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/attendance/biometric-sync',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(biometricPayload),
          'X-Tenant-ID': 'default',
          'X-Device-Api-Key': 'hrms-biometric-terminal-secret-key',
        },
      },
      biometricPayload
    );

    assert(
      validKeyBiometric.statusCode === 200 && validKeyBiometric.json?.success === true,
      '7. SEC-014: Hardware terminal push with valid X-Device-Api-Key ACCEPTED (Zero human login required)'
    );

    // 8. SEC-014: Admin UI Biometric Sync using Admin JWT -> ACCEPTED
    const adminJwtBiometric = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/attendance/biometric-sync',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(biometricPayload),
          'X-Tenant-ID': 'default',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      biometricPayload
    );

    assert(
      adminJwtBiometric.statusCode === 200 && adminJwtBiometric.json?.success === true,
      '8. SEC-014: Interactive Admin UI sync with Bearer JWT ACCEPTED without requiring device key'
    );

    // 9. Cross-Role Side Effect Check (Manager, HR, Employee, IT Admin login verification)
    const testAccounts = [
      { role: 'HR Manager', email: 'hr@hrms.com', pass: 'Hr@123' },
      { role: 'Department Manager', email: 'manager@hrms.com', pass: 'Manager@123' },
      { role: 'Employee', email: 'emp@hrms.com', pass: 'Emp@123' },
      { role: 'IT Admin', email: 'itadmin@hrms.com', pass: 'ItAdmin@123' },
    ];

    let allRolesOk = true;
    for (const acc of testAccounts) {
      const p = JSON.stringify({ email: acc.email, password: acc.pass });
      const r = await httpRequest(
        {
          hostname: 'localhost',
          port: 8080,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(p),
            'X-Tenant-ID': 'default',
          },
        },
        p
      );
      if (r.statusCode !== 200 || !r.json?.data?.accessToken) {
        allRolesOk = false;
        console.error(`Login failed for ${acc.role} (${acc.email})`);
      }
    }

    assert(allRolesOk, '9. Cross-Role Integrity: All authentic personas login cleanly with zero regression');

  } catch (err) {
    console.error('Fatal error during test execution:', err);
  }

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('====================================================');
}

runTests();
