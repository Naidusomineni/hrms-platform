const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

(async () => {
  const users = [
    { email: 'admin@hrms.com', pwd: 'Admin@123' },
    { email: 'hr@hrms.com', pwd: 'Hr@123' },
    { email: 'manager@hrms.com', pwd: 'Mgr@123' },
    { email: 'emp@hrms.com', pwd: 'Emp@123' },
  ];
  for (const u of users) {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: u.email, password: u.pwd });
    console.log(`${u.email}: status ${res.status}, success: ${res.data?.success}, msg: ${res.data?.message}`);
  }
})();

