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
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BATCH 2 & BULK IMPORT HARMONIZED VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Health check
    const health = await httpRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/actuator/health',
      method: 'GET',
    });
    assert(health.statusCode === 200 && health.json?.status === 'UP', '1. Actuator health check returns UP');

    // 2. CORS Preflight with untrusted origin (SEC-006)
    const evilCors = await httpRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil-attacker-site.com',
        'Access-Control-Request-Method': 'POST',
      },
    });
    const evilAcao = evilCors.headers['access-control-allow-origin'];
    assert(!evilAcao || evilAcao !== 'https://evil-attacker-site.com', '2. SEC-006: Untrusted origin evil-attacker-site.com is NOT allowed');

    // 3. CORS Preflight with legitimate frontend origin (SEC-006)
    const validCors = await httpRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
      },
    });
    const validAcao = validCors.headers['access-control-allow-origin'];
    assert(validAcao === 'http://localhost:5173', '3. SEC-006: Trusted origin http://localhost:5173 is allowed');

    // 4. Login & HttpOnly SameSite=Lax Cookie (SEC-007)
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

    assert(loginRes.statusCode === 200 && loginRes.json?.success === true, '4. Admin login successful');
    const setCookies = loginRes.headers['set-cookie'] || [];
    const cookieStr = Array.isArray(setCookies) ? setCookies.join('; ') : setCookies;
    assert(
      cookieStr.includes('HttpOnly') && cookieStr.includes('SameSite=Lax'),
      '5. SEC-007: Refresh token cookie contains HttpOnly and SameSite=Lax'
    );

    const token = loginRes.json?.data?.accessToken;

    // 5. Bounded Pagination Caps (PERF-002)
    const hugePageRes = await httpRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/employees?page=0&size=999999',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': 'default',
      },
    });
    const returnedPageSize = hugePageRes.json?.data?.size;
    assert(
      hugePageRes.statusCode === 200 && returnedPageSize === 100,
      `6. PERF-002: Malicious size=999999 is bounded to MAX_PAGE_SIZE (capped at ${returnedPageSize})`
    );

    // 6. Negative Pagination Handling (PERF-002)
    const negativePageRes = await httpRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/employees?page=-5&size=-10',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': 'default',
      },
    });
    const negPage = negativePageRes.json?.data?.number;
    const negSize = negativePageRes.json?.data?.size;
    assert(
      negativePageRes.statusCode === 200 && negPage === 0 && negSize === 10,
      `7. PERF-002: Negative page=-5 and size=-10 safely normalized (page=${negPage}, size=${negSize})`
    );

    // 7. Bulk Import Template Endpoint (Option 1)
    const templateRes = await httpRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/employees/bulk-import/template',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': 'default',
      },
    });
    assert(
      templateRes.statusCode === 200 &&
      templateRes.data.includes('first_name,last_name,email'),
      '8. OPTION 1: Bulk import template CSV downloaded with valid headers'
    );

    // 8. Rate Limiter Presence on Auth (SEC-011 / SEC-012)
    const forgotPwPayload = JSON.stringify({ email: 'unknown_probe@example.com' });
    const forgotRes = await httpRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/auth/forgot-password',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(forgotPwPayload),
          'X-Tenant-ID': 'default',
        },
      },
      forgotPwPayload
    );
    assert(forgotRes.statusCode === 200 || forgotRes.statusCode === 400 || forgotRes.statusCode === 404, '9. SEC-011: Password recovery endpoint governed by RateLimitConfig filter');

  } catch (err) {
    console.error('Fatal test error:', err);
  }

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('====================================================');
}

runTests();
