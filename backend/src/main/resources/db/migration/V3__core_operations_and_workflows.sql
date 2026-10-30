-- ==============================================================================
-- Flyway Migration V3: Core Operations, Geofencing, Workflows & DMS
-- Platform: HRMS Enterprise Platform 2.0.0 (PostgreSQL 18)
-- ==============================================================================

-- 1. Office Locations (for GPS Geofencing & IP Whitelisting)
CREATE TABLE IF NOT EXISTS office_locations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 200,
    ip_whitelist VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ol_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ol_tenant ON office_locations (tenant_id);

-- 2. Alter Attendance Table for Geofencing, Selfies & Regularization
ALTER TABLE attendance 
    ADD COLUMN IF NOT EXISTS check_in_latitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS check_in_longitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS check_out_latitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS check_out_longitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS geofence_status VARCHAR(30) DEFAULT 'INSIDE_GEOFENCE',
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50),
    ADD COLUMN IF NOT EXISTS office_location_id BIGINT REFERENCES office_locations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS selfie_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS regularization_status VARCHAR(30) DEFAULT 'NONE';

-- 3. Attendance Regularization Requests
CREATE TABLE IF NOT EXISTS attendance_regularizations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    attendance_id BIGINT REFERENCES attendance(id) ON DELETE SET NULL,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    requested_check_in TIME,
    requested_check_out TIME,
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'PENDING',
    reviewer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewer_comments VARCHAR(500),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_reg_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_att_reg_tenant_emp ON attendance_regularizations (tenant_id, employee_id, status);

-- 4. Dynamic Leave Policies per Tenant
CREATE TABLE IF NOT EXISTS leave_policies (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    leave_type VARCHAR(30) NOT NULL,
    annual_allowance NUMERIC(5, 2) NOT NULL DEFAULT 12.0,
    monthly_accrual_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    max_carry_over NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    allows_half_day BOOLEAN NOT NULL DEFAULT TRUE,
    requires_attachment BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lp_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uk_lp_tenant_type UNIQUE (tenant_id, leave_type)
);
CREATE INDEX IF NOT EXISTS idx_lp_tenant ON leave_policies (tenant_id);

-- 5. Granular Multi-Type Employee Leave Balances
CREATE TABLE IF NOT EXISTS employee_leave_balances (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(30) NOT NULL,
    allocated_days NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    used_days NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    pending_days NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    balance_days NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    year INTEGER NOT NULL DEFAULT 2026,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_elb_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uk_elb_emp_type_yr UNIQUE (tenant_id, employee_id, leave_type, year)
);
CREATE INDEX IF NOT EXISTS idx_elb_tenant_emp ON employee_leave_balances (tenant_id, employee_id, year);

-- 6. Universal Employee Self-Service (ESS) Requests (WFH, Shift Swap, Expense Claims, Travel)
CREATE TABLE IF NOT EXISTS employee_requests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    request_type VARCHAR(30) NOT NULL, -- 'WORK_FROM_HOME', 'SHIFT_CHANGE', 'EXPENSE_CLAIM', 'TRAVEL_REQUEST', 'BONAFIDE_LETTER'
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    amount NUMERIC(10, 2),
    attachment_url VARCHAR(500),
    status VARCHAR(25) NOT NULL DEFAULT 'PENDING',
    current_step INTEGER NOT NULL DEFAULT 1,
    approver_comments VARCHAR(500),
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_er_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_er_tenant_emp ON employee_requests (tenant_id, employee_id, status);

-- 7. Multi-Tier Workflow Engine: Definitions
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    module_type VARCHAR(30) NOT NULL, -- 'LEAVE', 'DOCUMENT', 'EXPENSE', 'REGULARIZATION', 'WFH'
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wd_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wd_tenant_mod ON workflow_definitions (tenant_id, module_type);

-- 8. Multi-Tier Workflow Engine: Steps
CREATE TABLE IF NOT EXISTS workflow_steps (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    workflow_definition_id BIGINT NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    approver_type VARCHAR(30) NOT NULL, -- 'REPORTING_MANAGER', 'SPECIFIC_ROLE', 'SPECIFIC_USER'
    approver_role VARCHAR(50), -- e.g. 'ROLE_HR', 'ROLE_ADMIN', 'ROLE_FINANCE'
    sla_hours INTEGER DEFAULT 48,
    is_auto_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ws_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uk_ws_def_order UNIQUE (workflow_definition_id, step_order)
);

-- 9. Multi-Tier Workflow Engine: Active Instances
CREATE TABLE IF NOT EXISTS workflow_instances (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    workflow_definition_id BIGINT NOT NULL REFERENCES workflow_definitions(id) ON DELETE RESTRICT,
    entity_type VARCHAR(30) NOT NULL, -- 'LEAVE', 'DOCUMENT', 'EMPLOYEE_REQUEST', 'REGULARIZATION'
    entity_id BIGINT NOT NULL,
    current_step_order INTEGER NOT NULL DEFAULT 1,
    total_steps INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(25) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
    initiated_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wi_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wi_tenant_ent ON workflow_instances (tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_wi_status ON workflow_instances (tenant_id, status);

-- 10. Multi-Tier Workflow Engine: Approvals Audit Trail
CREATE TABLE IF NOT EXISTS workflow_approvals (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    workflow_instance_id BIGINT NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision VARCHAR(25) NOT NULL, -- 'APPROVED', 'REJECTED', 'REQUEST_CHANGE'
    comments VARCHAR(500),
    ip_address VARCHAR(50),
    decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wa_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wa_instance ON workflow_approvals (workflow_instance_id);

-- 11. Enterprise Document Management System (DMS)
CREATE TABLE IF NOT EXISTS employee_documents (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'GOVERNMENT_ID', 'ACADEMIC', 'EXPERIENCE', 'TAX', 'COMPANY_POLICY', 'PAYSLIP'
    title VARCHAR(150) NOT NULL,
    document_number VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(25) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'
    verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    verification_remarks VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ed_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ed_emp_cat ON employee_documents (tenant_id, employee_id, category);
CREATE INDEX IF NOT EXISTS idx_ed_expiry ON employee_documents (tenant_id, expiry_date);

-- 12. Policy Read-Acknowledgements
CREATE TABLE IF NOT EXISTS policy_acknowledgements (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    document_id BIGINT NOT NULL REFERENCES employee_documents(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    CONSTRAINT fk_pa_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uk_pa_doc_emp UNIQUE (tenant_id, document_id, employee_id)
);

-- ==============================================================================
-- 13. SEED DEFAULT ENTERPRISE DATA FOR DEFAULT TENANT
-- ==============================================================================

-- Seed Default Office Location (Tech Park HQ)
INSERT INTO office_locations (tenant_id, name, address, latitude, longitude, radius_meters, ip_whitelist, is_active)
VALUES ('default', 'Global Headquarters - Innovation Tower', 'Tech Boulevard, Block 4, Suite 800', 12.9716000, 77.5946000, 250, '192.168.1.0/24,10.0.0.0/16', TRUE)
ON CONFLICT DO NOTHING;

-- Seed Standard Leave Policies
INSERT INTO leave_policies (tenant_id, leave_type, annual_allowance, monthly_accrual_rate, max_carry_over, allows_half_day, requires_attachment, is_active)
VALUES 
    ('default', 'ANNUAL', 18.0, 1.5, 10.0, TRUE, FALSE, TRUE),
    ('default', 'CASUAL', 12.0, 1.0, 0.0, TRUE, FALSE, TRUE),
    ('default', 'SICK', 12.0, 1.0, 5.0, TRUE, TRUE, TRUE),
    ('default', 'MATERNITY', 180.0, 0.0, 0.0, FALSE, TRUE, TRUE),
    ('default', 'PATERNITY', 15.0, 0.0, 0.0, FALSE, TRUE, TRUE),
    ('default', 'UNPAID', 30.0, 0.0, 0.0, TRUE, FALSE, TRUE)
ON CONFLICT (tenant_id, leave_type) DO NOTHING;

-- Initialize Leave Balances for all current employees in 2026
INSERT INTO employee_leave_balances (tenant_id, employee_id, leave_type, allocated_days, used_days, pending_days, balance_days, year)
SELECT 
    e.tenant_id,
    e.id,
    lp.leave_type,
    lp.annual_allowance,
    0.0,
    0.0,
    lp.annual_allowance,
    2026
FROM employees e
CROSS JOIN leave_policies lp
WHERE lp.tenant_id = e.tenant_id
ON CONFLICT (tenant_id, employee_id, leave_type, year) DO NOTHING;

-- Seed Default Workflow: Multi-Tier Leave Approval (Step 1: Manager -> Step 2: HR)
INSERT INTO workflow_definitions (tenant_id, module_type, name, description, is_active)
VALUES ('default', 'LEAVE', 'Standard Two-Tier Leave Approval', 'Requires direct Reporting Manager approval followed by HR verification', TRUE)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
    def_id BIGINT;
BEGIN
    SELECT id INTO def_id FROM workflow_definitions WHERE tenant_id = 'default' AND module_type = 'LEAVE' LIMIT 1;
    IF def_id IS NOT NULL THEN
        INSERT INTO workflow_steps (tenant_id, workflow_definition_id, step_order, step_name, approver_type, approver_role, sla_hours)
        VALUES 
            ('default', def_id, 1, 'Reporting Manager Approval', 'REPORTING_MANAGER', NULL, 48),
            ('default', def_id, 2, 'HR Operations Verification', 'SPECIFIC_ROLE', 'ROLE_HR', 24)
        ON CONFLICT (workflow_definition_id, step_order) DO NOTHING;
    END IF;
END $$;

-- Seed Default Workflow: WFH Approval (Single Step: Reporting Manager)
INSERT INTO workflow_definitions (tenant_id, module_type, name, description, is_active)
VALUES ('default', 'WORK_FROM_HOME', 'Work From Home Manager Approval', 'Direct Reporting Manager approval required for remote work days', TRUE)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
    def_id BIGINT;
BEGIN
    SELECT id INTO def_id FROM workflow_definitions WHERE tenant_id = 'default' AND module_type = 'WORK_FROM_HOME' LIMIT 1;
    IF def_id IS NOT NULL THEN
        INSERT INTO workflow_steps (tenant_id, workflow_definition_id, step_order, step_name, approver_type, approver_role, sla_hours)
        VALUES 
            ('default', def_id, 1, 'Reporting Manager Approval', 'REPORTING_MANAGER', NULL, 24)
        ON CONFLICT (workflow_definition_id, step_order) DO NOTHING;
    END IF;
END $$;
