const { execSync } = require('child_process');
const fs = require('fs');

const sql = `
BEGIN;

-- 1. PURGE TRANSACTIONAL CLUTTER IN tenant_eoxys
TRUNCATE TABLE tenant_eoxys.attendance CASCADE;
TRUNCATE TABLE tenant_eoxys.attendance_regularizations CASCADE;
TRUNCATE TABLE tenant_eoxys.shift_swap_requests CASCADE;
TRUNCATE TABLE tenant_eoxys.leave_requests CASCADE;
TRUNCATE TABLE tenant_eoxys.payroll_slips CASCADE;
TRUNCATE TABLE tenant_eoxys.tax_declarations CASCADE;
TRUNCATE TABLE tenant_eoxys.expense_claims CASCADE;
TRUNCATE TABLE tenant_eoxys.support_tickets CASCADE;
TRUNCATE TABLE tenant_eoxys.ticket_comments CASCADE;
TRUNCATE TABLE tenant_eoxys.candidates CASCADE;
TRUNCATE TABLE tenant_eoxys.interview_sessions CASCADE;
TRUNCATE TABLE tenant_eoxys.interview_scorecards CASCADE;
TRUNCATE TABLE tenant_eoxys.interview_panelists CASCADE;
TRUNCATE TABLE tenant_eoxys.workflow_instances CASCADE;
TRUNCATE TABLE tenant_eoxys.workflow_approvals CASCADE;
TRUNCATE TABLE tenant_eoxys.employee_separations CASCADE;
TRUNCATE TABLE tenant_eoxys.separation_clearances CASCADE;
TRUNCATE TABLE tenant_eoxys.full_and_final_settlements CASCADE;
TRUNCATE TABLE tenant_eoxys.employee_documents CASCADE;
TRUNCATE TABLE tenant_eoxys.flight_risk_evaluations CASCADE;
TRUNCATE TABLE tenant_eoxys.performance_reviews CASCADE;
TRUNCATE TABLE tenant_eoxys.employee_goals CASCADE;
TRUNCATE TABLE tenant_eoxys.notifications CASCADE;
TRUNCATE TABLE tenant_eoxys.announcement_acknowledgments CASCADE;
TRUNCATE TABLE tenant_eoxys.employee_leave_balances CASCADE;

-- 2. PURGE TRANSACTIONAL CLUTTER IN public (Legacy leftovers)
TRUNCATE TABLE public.attendance CASCADE;
TRUNCATE TABLE public.leave_requests CASCADE;
TRUNCATE TABLE public.payroll_slips CASCADE;
TRUNCATE TABLE public.expense_claims CASCADE;
TRUNCATE TABLE public.support_tickets CASCADE;
TRUNCATE TABLE public.candidates CASCADE;
TRUNCATE TABLE public.workflow_instances CASCADE;
TRUNCATE TABLE public.employee_separations CASCADE;
TRUNCATE TABLE public.separation_clearances CASCADE;
TRUNCATE TABLE public.full_and_final_settlements CASCADE;
TRUNCATE TABLE public.employee_documents CASCADE;
TRUNCATE TABLE public.flight_risk_evaluations CASCADE;
TRUNCATE TABLE public.performance_reviews CASCADE;
TRUNCATE TABLE public.employee_goals CASCADE;
TRUNCATE TABLE public.employee_leave_balances CASCADE;
TRUNCATE TABLE public.notifications CASCADE;

-- 3. CLEAN UP TEST EMPLOYEES IN BOTH SCHEMAS
DELETE FROM tenant_eoxys.employees 
WHERE email NOT IN (
  'admin@hrms.com',
  'hr@hrms.com',
  'manager@hrms.com',
  'emp@hrms.com',
  'itadmin@hrms.com',
  'bapanaidusomineni@gmail.com',
  'chelikamcharankumar@gmail.com'
);

DELETE FROM public.employees 
WHERE email NOT IN (
  'admin@hrms.com',
  'hr@hrms.com',
  'manager@hrms.com',
  'emp@hrms.com',
  'itadmin@hrms.com',
  'bapanaidusomineni@gmail.com',
  'chelikamcharankumar@gmail.com'
);

-- Reset leave balances and ensure active status on the 7 real employees in tenant_eoxys
UPDATE tenant_eoxys.employees
SET 
  leave_balance = 18,
  sick_leave_balance = 12,
  casual_leave_balance = 12,
  employment_status = 'ACTIVE',
  deleted = false
WHERE email IN (
  'admin@hrms.com',
  'hr@hrms.com',
  'manager@hrms.com',
  'emp@hrms.com',
  'itadmin@hrms.com',
  'bapanaidusomineni@gmail.com',
  'chelikamcharankumar@gmail.com'
);

-- Ensure correct department mapping:
-- Dept 1: Engineering (Manager Vikram Singh, Rahul Kumar, Bapanaidu, Charan Kumar)
-- Dept 2: Human Resources (Priya Sharma)
-- Dept 4: Marketing / IT (Suresh Verma)
UPDATE tenant_eoxys.employees SET department_id = 1 WHERE email IN ('manager@hrms.com', 'emp@hrms.com', 'bapanaidusomineni@gmail.com', 'chelikamcharankumar@gmail.com');
UPDATE tenant_eoxys.employees SET department_id = 2 WHERE email = 'hr@hrms.com';
UPDATE tenant_eoxys.employees SET department_id = 4 WHERE email = 'itadmin@hrms.com';
UPDATE tenant_eoxys.employees SET department_id = 1 WHERE email = 'admin@hrms.com';

-- Ensure reporting hierarchy: Rahul, Bapanaidu, and Charan report to Vikram Singh
UPDATE tenant_eoxys.employees SET manager_id = (SELECT id FROM tenant_eoxys.employees WHERE email = 'manager@hrms.com')
WHERE email IN ('emp@hrms.com', 'bapanaidusomineni@gmail.com', 'chelikamcharankumar@gmail.com');

-- 4. SEED FRESH LEAVE BALANCES FOR ALL 7 EMPLOYEES FOR 2026
INSERT INTO tenant_eoxys.employee_leave_balances (tenant_id, employee_id, leave_type, allocated_days, used_days, pending_days, balance_days, year, created_at, updated_at)
SELECT 'eoxys', e.id, lp.leave_type, lp.annual_allowance, 0, 0, lp.annual_allowance, 2026, NOW(), NOW()
FROM tenant_eoxys.employees e
CROSS JOIN tenant_eoxys.leave_policies lp
WHERE lp.leave_type IN ('ANNUAL', 'CASUAL', 'SICK');

-- 5. CONFIGURE OFFICE TIMINGS: 10:00 AM TO 07:00 PM (10:00:00 TO 19:00:00)
-- Update Attendance Policies dynamically (no hardcoding in application code!)
UPDATE tenant_eoxys.attendance_policies
SET 
  shift_start_time = '10:00:00',
  shift_end_time = '19:00:00',
  grace_period_minutes = 15,
  full_day_hours = 8.0,
  half_day_hours = 4.0,
  updated_at = NOW()
WHERE policy_code = 'STD_CORPORATE';

UPDATE tenant_eoxys.attendance_policies
SET 
  shift_start_time = '10:00:00',
  shift_end_time = '19:00:00',
  grace_period_minutes = 30,
  full_day_hours = 8.0,
  half_day_hours = 4.0,
  updated_at = NOW()
WHERE policy_code = 'TECH_FLEXI';

-- Clean Shifts: Keep 3 standard shifts, delete test generated shifts (id > 3)
DELETE FROM tenant_eoxys.shifts WHERE id > 3;

UPDATE tenant_eoxys.shifts
SET 
  name = 'General Day Shift (HQ)',
  start_time = '10:00:00',
  end_time = '19:00:00',
  updated_at = NOW()
WHERE id = 1;

UPDATE tenant_eoxys.shifts
SET 
  name = 'Morning Early Shift',
  start_time = '06:00:00',
  end_time = '15:00:00',
  updated_at = NOW()
WHERE id = 2;

UPDATE tenant_eoxys.shifts
SET 
  name = 'Overnight Support Shift',
  start_time = '21:00:00',
  end_time = '06:00:00',
  updated_at = NOW()
WHERE id = 3;

-- 6. SEED 2 CLEAN JOB OPENINGS FOR RECRUITMENT DEMO
TRUNCATE TABLE tenant_eoxys.job_openings CASCADE;

INSERT INTO tenant_eoxys.job_openings (tenant_id, department_id, title, description, openings_count, min_experience, max_experience, budget_min, budget_max, job_type, status, created_at, updated_at)
VALUES 
('eoxys', 1, 'Senior Full-Stack Engineer (React / Spring Boot)', 'Key engineering role responsible for scalable microservices and modern React UI.', 2, 4, 8, 1400000, 2200000, 'FULL_TIME', 'OPEN', NOW(), NOW()),
('eoxys', 1, 'Cloud Infrastructure & DevOps Lead', 'Architect and maintain Kubernetes, CI/CD pipelines, and multi-cloud AWS/GCP clusters.', 1, 5, 9, 1800000, 2600000, 'FULL_TIME', 'OPEN', NOW(), NOW());

-- 7. PURGE TEST USERS IN public.users (Keep 7 real emails)
DELETE FROM public.login_history 
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE email IN (
    'admin@hrms.com',
    'hr@hrms.com',
    'manager@hrms.com',
    'emp@hrms.com',
    'itadmin@hrms.com',
    'bapanaidusomineni@gmail.com',
    'chelikamcharankumar@gmail.com'
  )
);

DELETE FROM public.refresh_tokens 
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE email IN (
    'admin@hrms.com',
    'hr@hrms.com',
    'manager@hrms.com',
    'emp@hrms.com',
    'itadmin@hrms.com',
    'bapanaidusomineni@gmail.com',
    'chelikamcharankumar@gmail.com'
  )
);

DELETE FROM public.user_roles 
WHERE user_id NOT IN (
  SELECT id FROM public.users WHERE email IN (
    'admin@hrms.com',
    'hr@hrms.com',
    'manager@hrms.com',
    'emp@hrms.com',
    'itadmin@hrms.com',
    'bapanaidusomineni@gmail.com',
    'chelikamcharankumar@gmail.com'
  )
);

DELETE FROM public.audit_logs 
WHERE performed_by NOT IN (
  'admin@hrms.com',
  'hr@hrms.com',
  'manager@hrms.com',
  'emp@hrms.com',
  'itadmin@hrms.com',
  'bapanaidusomineni@gmail.com',
  'chelikamcharankumar@gmail.com'
) AND performed_by IS NOT NULL;

DELETE FROM public.users 
WHERE email NOT IN (
  'admin@hrms.com',
  'hr@hrms.com',
  'manager@hrms.com',
  'emp@hrms.com',
  'itadmin@hrms.com',
  'bapanaidusomineni@gmail.com',
  'chelikamcharankumar@gmail.com'
);

-- Ensure all 7 users have tenant_id = 'eoxys' and is_active = true
UPDATE public.users 
SET tenant_id = 'eoxys', is_active = true, deleted = false;

COMMIT;
`;

fs.writeFileSync('reset_fresh_demo.sql', sql, 'utf8');
try {
  const out = execSync(`powershell -Command "$env:PGPASSWORD = 'Naidu@98666'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -p 5433 -d hrms_db -f reset_fresh_demo.sql"`, { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.stdout || e.message);
} finally {
  if (fs.existsSync('reset_fresh_demo.sql')) fs.unlinkSync('reset_fresh_demo.sql');
}
