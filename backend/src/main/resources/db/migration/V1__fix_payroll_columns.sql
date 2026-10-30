-- Migrate the payroll table so the new columns used by JPA are authoritative.
-- Make old legacy columns nullable and remove old indexes tied to them.

ALTER TABLE payroll_slips DROP INDEX uk_payroll;
ALTER TABLE payroll_slips DROP INDEX idx_payroll_period;
ALTER TABLE payroll_slips MODIFY COLUMN `month` INT NULL;
ALTER TABLE payroll_slips MODIFY COLUMN `year` INT NULL;

-- Add indexes for the new payroll_month/payroll_year columns.
ALTER TABLE payroll_slips ADD UNIQUE KEY uk_payroll (employee_id, payroll_month, payroll_year);
ALTER TABLE payroll_slips ADD INDEX idx_payroll_period (payroll_year, payroll_month);
