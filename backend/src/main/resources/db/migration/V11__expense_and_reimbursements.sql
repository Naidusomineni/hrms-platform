-- V11: Enterprise Expense Claims, Reimbursements & Payroll Integration

-- 1. Create expense_claims table
CREATE TABLE IF NOT EXISTS expense_claims (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    employee_id BIGINT NOT NULL,
    claim_number VARCHAR(32) NOT NULL,
    category VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    receipt_url VARCHAR(512),
    receipt_filename VARCHAR(255),
    manager_id BIGINT,
    manager_remarks TEXT,
    manager_reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    finance_reviewer_id BIGINT,
    finance_remarks TEXT,
    finance_reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    payroll_slip_id BIGINT,
    disbursed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    updated_by VARCHAR(150),
    CONSTRAINT fk_exp_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_exp_mgr FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT fk_exp_fin FOREIGN KEY (finance_reviewer_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT fk_exp_slip FOREIGN KEY (payroll_slip_id) REFERENCES payroll_slips(id) ON DELETE SET NULL,
    CONSTRAINT chk_exp_status CHECK (status IN ('SUBMITTED', 'MANAGER_APPROVED', 'FINANCE_APPROVED', 'DISBURSED', 'REJECTED')),
    CONSTRAINT chk_exp_category CHECK (category IN ('TRAVEL', 'MEALS', 'INTERNET_WFH', 'OFFICE_SUPPLIES', 'FUEL', 'CERTIFICATION', 'OTHER'))
);

-- Unique claim number per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uk_exp_claim_number ON expense_claims(tenant_id, claim_number);
CREATE INDEX IF NOT EXISTS idx_exp_tenant_emp ON expense_claims(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_exp_tenant_status ON expense_claims(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_exp_date ON expense_claims(expense_date);

-- 2. Add reimbursements column to payroll_slips for auto-sync
ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS reimbursements NUMERIC(12,2) DEFAULT 0.00;

-- 3. Seed demo expense claims for default tenant
INSERT INTO expense_claims (
    tenant_id, employee_id, claim_number, category, title, description, amount, expense_date, status, created_at, updated_at
)
SELECT 
    'default',
    e.id,
    'EXP-2026-0001',
    'INTERNET_WFH',
    'High-Speed Fiber Broadband - Hybrid Work',
    'Monthly corporate broadband reimbursement for remote development and client support.',
    1499.00,
    CURRENT_DATE - INTERVAL '15 days',
    'FINANCE_APPROVED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM employees e 
WHERE e.tenant_id = 'default' 
ORDER BY e.id ASC 
LIMIT 1
ON CONFLICT (tenant_id, claim_number) DO NOTHING;

INSERT INTO expense_claims (
    tenant_id, employee_id, claim_number, category, title, description, amount, expense_date, status, created_at, updated_at
)
SELECT 
    'default',
    e.id,
    'EXP-2026-0002',
    'TRAVEL',
    'Client Architecture Review - Metro Cab Fare',
    'Client on-site visit for quarterly architecture sync & security briefing.',
    850.00,
    CURRENT_DATE - INTERVAL '10 days',
    'MANAGER_APPROVED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM employees e 
WHERE e.tenant_id = 'default' 
ORDER BY e.id ASC 
LIMIT 1
ON CONFLICT (tenant_id, claim_number) DO NOTHING;

INSERT INTO expense_claims (
    tenant_id, employee_id, claim_number, category, title, description, amount, expense_date, status, created_at, updated_at
)
SELECT 
    'default',
    e.id,
    'EXP-2026-0003',
    'CERTIFICATION',
    'AWS Certified Solutions Architect Exam Fee',
    'Annual enterprise upskilling certification program claim.',
    12500.00,
    CURRENT_DATE - INTERVAL '5 days',
    'SUBMITTED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM employees e 
WHERE e.tenant_id = 'default' 
ORDER BY e.id ASC 
LIMIT 1
ON CONFLICT (tenant_id, claim_number) DO NOTHING;
