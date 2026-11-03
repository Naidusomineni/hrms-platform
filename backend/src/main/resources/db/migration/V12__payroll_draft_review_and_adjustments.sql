-- V12: Enterprise Payroll Draft, Review & HR Adjustments Workflow

ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS bonus NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS overtime_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS deductions_adjustment NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS hr_remarks VARCHAR(500);
ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS adjusted_by VARCHAR(100);
ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS adjusted_at TIMESTAMP WITHOUT TIME ZONE;

-- Update status check constraint to support APPROVED
ALTER TABLE payroll_slips DROP CONSTRAINT IF EXISTS payroll_slips_status_check;
ALTER TABLE payroll_slips ADD CONSTRAINT payroll_slips_status_check CHECK (status IN ('DRAFT', 'PROCESSING', 'PROCESSED', 'APPROVED', 'PAID', 'FAILED'));

-- Performance index for HR payroll register search & status filtering
CREATE INDEX IF NOT EXISTS idx_payroll_tenant_status ON payroll_slips(tenant_id, payroll_year, payroll_month, status);
