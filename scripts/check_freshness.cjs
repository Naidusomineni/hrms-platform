const { execSync } = require('child_process');
const fs = require('fs');

const sql = `
\\echo '=== OFFICE_LOCATIONS COLUMNS ==='
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'tenant_eoxys' AND table_name = 'office_locations';

\\echo '=== ATTENDANCE_POLICIES COLUMNS ==='
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'tenant_eoxys' AND table_name = 'attendance_policies';

\\echo '=== CURRENT OFFICE LOCATIONS ==='
SELECT * FROM tenant_eoxys.office_locations;

\\echo '=== CURRENT ATTENDANCE POLICIES ==='
SELECT * FROM tenant_eoxys.attendance_policies;
`;

fs.writeFileSync('temp_check.sql', sql, 'utf8');
try {
  const out = execSync(`powershell -Command "$env:PGPASSWORD='Naidu@98666'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -p 5433 -d hrms_db -f temp_check.sql"`, { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.stdout || e.message);
} finally {
  if (fs.existsSync('temp_check.sql')) fs.unlinkSync('temp_check.sql');
}
