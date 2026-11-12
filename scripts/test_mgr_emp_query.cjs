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
  const login = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'manager@hrms.com', password: 'Manager@123' });
  
  console.log('Manager login:', login.status, login.data?.data?.role);
  const token = login.data?.data?.accessToken;

  // Decode JWT payload
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
  console.log('JWT Claims:', payload);

  const empRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/employees?size=300',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Employee query result:', empRes.status, empRes.data);
})();

