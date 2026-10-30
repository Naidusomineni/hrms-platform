-- =========================================================================
-- V7: Phase 4 Milestone 3 - Employee Separation, Multi-Department Clearance
--     and Full & Final (F&F) Settlement Engine
-- =========================================================================

-- 1. Employee Separations (Resignations, Terminations, End-of-Contract)
CREATE TABLE IF NOT EXISTS employee_separations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    resignation_date DATE NOT NULL,
    requested_last_working_day DATE,
    approved_last_working_day DATE,
    reason TEXT,
    separation_type VARCHAR(32) NOT NULL DEFAULT 'RESIGNATION',
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    reviewer_id BIGINT REFERENCES users(id),
    reviewer_comments TEXT,
    exit_interview_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employee_separations_tenant_emp ON employee_separations(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_separations_status ON employee_separations(tenant_id, status);

-- 2. Multi-Department NOC Clearance Checklists
CREATE TABLE IF NOT EXISTS separation_clearances (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    separation_id BIGINT NOT NULL REFERENCES employee_separations(id) ON DELETE CASCADE,
    department_type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    cleared_by VARCHAR(120),
    cleared_at TIMESTAMP,
    pending_dues NUMERIC(12,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_separation_clearances_sep ON separation_clearances(separation_id);

-- 3. Full & Final Settlement (F&F) Statements
CREATE TABLE IF NOT EXISTS full_and_final_settlements (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    separation_id BIGINT NOT NULL REFERENCES employee_separations(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    settlement_date DATE NOT NULL,
    last_drawn_basic NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tenure_years NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    earned_leave_balance INT DEFAULT 0,
    leave_encashment_amount NUMERIC(12,2) DEFAULT 0.00,
    gratuity_amount NUMERIC(12,2) DEFAULT 0.00,
    bonus_amount NUMERIC(12,2) DEFAULT 0.00,
    prorated_salary_amount NUMERIC(12,2) DEFAULT 0.00,
    notice_pay_recovery NUMERIC(12,2) DEFAULT 0.00,
    asset_recovery_deduction NUMERIC(12,2) DEFAULT 0.00,
    statutory_deductions NUMERIC(12,2) DEFAULT 0.00,
    net_payable_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    remarks TEXT,
    disbursed_at TIMESTAMP,
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fnf_settlements_tenant_emp ON full_and_final_settlements(tenant_id, employee_id);
