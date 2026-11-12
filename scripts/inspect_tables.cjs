const { execSync } = require('child_process');
const fs = require('fs');

const sql = `
UPDATE public.users 
SET password = (SELECT password FROM public.users WHERE email = 'admin@hrms.com')
WHERE email IN ('bapanaidusomineni@gmail.com', 'chelikamcharankumar@gmail.com');
`;

fs.writeFileSync('temp_pwd_sync.sql', sql, 'utf8');
try {
  const out = execSync(`powershell -Command "$env:PGPASSWORD = 'Naidu@98666'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -p 5433 -d hrms_db -f temp_pwd_sync.sql"`, { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.stdout || e.message);
} finally {
  if (fs.existsSync('temp_pwd_sync.sql')) fs.unlinkSync('temp_pwd_sync.sql');
}
