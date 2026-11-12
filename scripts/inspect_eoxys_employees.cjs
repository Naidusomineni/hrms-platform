const { execSync } = require('child_process');
const fs = require('fs');

const sql = `
SELECT id, employee_number, first_name, last_name, email, designation, department_id, manager_id, user_id, deleted 
FROM tenant_eoxys.employees WHERE deleted = false ORDER BY id;
`;

fs.writeFileSync('temp_inspect.sql', sql, 'utf8');
try {
  const out = execSync(`powershell -Command "$env:PGPASSWORD = 'Naidu@98666'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -p 5433 -d hrms_db -f temp_inspect.sql"`, { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.stdout || e.message);
} finally {
  if (fs.existsSync('temp_inspect.sql')) fs.unlinkSync('temp_inspect.sql');
}
