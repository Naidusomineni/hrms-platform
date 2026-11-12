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
  const passwords = ['Naidu@98666', 'Admin@123', 'Emp@123', 'Password@123', 'bapan@123'];
  for (const p of passwords) {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'bapanaidusomineni@gmail.com', password: p });
    console.log(`Password "${p}": status ${res.status}, success: ${res.data?.success}`);
    if (res.status === 200) break;
  }
})();

