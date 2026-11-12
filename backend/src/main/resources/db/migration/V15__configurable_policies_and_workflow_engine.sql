-- ============================================================================
-- V15: Configurable Attendance Policies, Universal Workflow Engine & Tenant Module Manifests
-- ============================================================================

-- 1. Tenant Module Manifests (Feature Flags / Subscription Enablement)
CREATE TABLE IF NOT EXISTS tenant_module_manifests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    module_key VARCHAR(64) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tenant_module UNIQUE(tenant_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_tmm_tenant ON tenant_module_manifests(tenant_id, is_enabled);

-- 2. Configurable Attendance Policies
CREATE TABLE IF NOT EXISTS attendance_policies (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_name VARCHAR(150) NOT NULL,
    policy_code VARCHAR(50) NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    allowed_punch_methods VARCHAR(255) NOT NULL DEFAULT 'BIOMETRIC,WEB,GEOFENCE',
    grace_period_minutes INT NOT NULL DEFAULT 15,
    max_late_allowed_per_month INT NOT NULL DEFAULT 3,
    late_penalty_action VARCHAR(32) NOT NULL DEFAULT 'FLAG_ONLY', -- FLAG_ONLY, DEDUCT_HALF_DAY, DEDUCT_LEAVE, LOSS_OF_PAY
    full_day_hours NUMERIC(4,2) NOT NULL DEFAULT 8.00,
    half_day_hours NUMERIC(4,2) NOT NULL DEFAULT 4.00,
    absent_threshold_hours NUMERIC(4,2) NOT NULL DEFAULT 3.00,
    early_departure_minutes INT NOT NULL DEFAULT 30,
    early_departure_penalty VARCHAR(32) NOT NULL DEFAULT 'FLAG_ONLY',
    overtime_enabled BOOLEAN NOT NULL DEFAULT true,
    min_overtime_threshold_minutes INT NOT NULL DEFAULT 60,
    overtime_requires_approval BOOLEAN NOT NULL DEFAULT true,
    auto_deduct_break BOOLEAN NOT NULL DEFAULT false,
    break_deduction_minutes INT NOT NULL DEFAULT 45,
    max_regularizations_per_month INT NOT NULL DEFAULT 3,
    regularization_filing_window_days INT NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_att_policy_tenant_code UNIQUE(tenant_id, policy_code)
);

CREATE INDEX IF NOT EXISTS idx_att_policy_tenant ON attendance_policies(tenant_id, is_active);

-- 3. Policy Hierarchy Assignments
CREATE TABLE IF NOT EXISTS policy_assignments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_type VARCHAR(32) NOT NULL DEFAULT 'ATTENDANCE', -- ATTENDANCE, LEAVE
    policy_id BIGINT NOT NULL REFERENCES attendance_policies(id) ON DELETE CASCADE,
    department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
    office_location_id BIGINT REFERENCES office_locations(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    priority_level INT NOT NULL DEFAULT 4, -- 1: Employee, 2: Department, 3: Location, 4: Tenant Default
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pa_tenant_lookup ON policy_assignments(tenant_id, policy_type, employee_id, department_id, office_location_id);

-- 4. Out-of-Office Approval Delegations
CREATE TABLE IF NOT EXISTS approval_delegations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    delegator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegatee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    request_types VARCHAR(255) NOT NULL DEFAULT 'ALL', -- ALL, or comma-separated
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_delegator ON approval_delegations(tenant_id, delegator_id, is_active, start_date, end_date);

-- 5. Seed Module Manifests for default and eoxys
DO $$
DECLARE
    tid TEXT;
    mod TEXT;
    mods TEXT[] := ARRAY[
        'DASHBOARD', 'EMPLOYEES', 'DEPARTMENTS', 'ATTENDANCE', 'SHIFTS', 
        'LEAVES', 'REQUESTS', 'APPROVALS', 'PAYROLL', 'EXPENSES', 
        'RECRUITMENT', 'DOCUMENTS', 'ASSETS', 'HELPDESK', 'PERFORMANCE', 
        'INTELLIGENCE', 'COMMUNICATION', 'REPORTS', 'OFFBOARDING', 'SETTINGS'
    ];
BEGIN
    FOR tid IN SELECT id FROM tenants LOOP
        FOREACH mod IN ARRAY mods LOOP
            INSERT INTO tenant_module_manifests (tenant_id, module_key, is_enabled)
            VALUES (tid, mod, true)
            ON CONFLICT (tenant_id, module_key) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 6. Seed Default Standard Attendance Policies
DO $$
DECLARE
    tid TEXT;
    pid BIGINT;
BEGIN
    FOR tid IN SELECT id FROM tenants LOOP
        IF NOT EXISTS (SELECT 1 FROM attendance_policies WHERE tenant_id = tid AND policy_code = 'STD_CORPORATE') THEN
            INSERT INTO attendance_policies (
                tenant_id, policy_name, policy_code, description, is_default,
                effective_from, allowed_punch_methods, grace_period_minutes,
                max_late_allowed_per_month, late_penalty_action, full_day_hours,
                half_day_hours, absent_threshold_hours, early_departure_minutes,
                overtime_enabled, min_overtime_threshold_minutes, max_regularizations_per_month,
                regularization_filing_window_days, is_active
            ) VALUES (
                tid, 'Standard Corporate Policy', 'STD_CORPORATE',
                'Default company attendance policy with 15m grace and 3 late-mark forgiveness',
                true, CURRENT_DATE, 'BIOMETRIC,WEB,GEOFENCE', 15,
                3, 'FLAG_ONLY', 8.00,
                4.00, 3.00, 30,
                true, 60, 3, 5, true
            ) RETURNING id INTO pid;

            -- Assign as tenant default (priority 4)
            INSERT INTO policy_assignments (tenant_id, policy_type, policy_id, priority_level)
            VALUES (tid, 'ATTENDANCE', pid, 4);
        END IF;

        -- Seed Tech Team Flexi Policy
        IF NOT EXISTS (SELECT 1 FROM attendance_policies WHERE tenant_id = tid AND policy_code = 'TECH_FLEXI') THEN
            INSERT INTO attendance_policies (
                tenant_id, policy_name, policy_code, description, is_default,
                effective_from, allowed_punch_methods, grace_period_minutes,
                max_late_allowed_per_month, late_penalty_action, full_day_hours,
                half_day_hours, absent_threshold_hours, early_departure_minutes,
                overtime_enabled, min_overtime_threshold_minutes, max_regularizations_per_month,
                regularization_filing_window_days, is_active
            ) VALUES (
                tid, 'Engineering & Design Flexible Policy', 'TECH_FLEXI',
                'Flexible working hours for product, design, and engineering staff with 30m grace',
                false, CURRENT_DATE, 'WEB,GEOFENCE,BIOMETRIC', 30,
                5, 'FLAG_ONLY', 8.00,
                4.00, 2.50, 45,
                true, 45, 5, 7, true
            );
        END IF;
    END LOOP;
END $$;

-- 7. Ensure Workflow Definitions exist for ATTENDANCE_REGULARIZATION, OVERTIME, ON_DUTY
DO $$
DECLARE
    tid TEXT;
    w_id BIGINT;
BEGIN
    FOR tid IN SELECT id FROM tenants LOOP
        -- Regularization Workflow
        IF NOT EXISTS (SELECT 1 FROM workflow_definitions WHERE tenant_id = tid AND module_type = 'ATTENDANCE_REGULARIZATION') THEN
            INSERT INTO workflow_definitions (tenant_id, module_type, name, description, is_active)
            VALUES (tid, 'ATTENDANCE_REGULARIZATION', 'Attendance Regularization Review', 'Direct Reporting Manager approval for missed punches and time corrections', true)
            RETURNING id INTO w_id;

            INSERT INTO workflow_steps (tenant_id, workflow_definition_id, step_order, step_name, approver_type, approver_role, sla_hours, is_auto_approved)
            VALUES (tid, w_id, 1, 'Reporting Manager Approval', 'REPORTING_MANAGER', NULL, 24, false);
        END IF;

        -- Overtime Workflow
        IF NOT EXISTS (SELECT 1 FROM workflow_definitions WHERE tenant_id = tid AND module_type = 'OVERTIME') THEN
            INSERT INTO workflow_definitions (tenant_id, module_type, name, description, is_active)
            VALUES (tid, 'OVERTIME', 'Overtime Pre-Authorization', 'Manager authorization for overtime hours prior to payroll credit', true)
            RETURNING id INTO w_id;

            INSERT INTO workflow_steps (tenant_id, workflow_definition_id, step_order, step_name, approver_type, approver_role, sla_hours, is_auto_approved)
            VALUES (tid, w_id, 1, 'Reporting Manager Sign-Off', 'REPORTING_MANAGER', NULL, 48, false);
        END IF;

        -- On-Duty / Client Visit Workflow
        IF NOT EXISTS (SELECT 1 FROM workflow_definitions WHERE tenant_id = tid AND module_type = 'ON_DUTY') THEN
            INSERT INTO workflow_definitions (tenant_id, module_type, name, description, is_active)
            VALUES (tid, 'ON_DUTY', 'On-Duty / Client Visit Approval', 'Manager sign-off for off-site client meetings and field assignments', true)
            RETURNING id INTO w_id;

            INSERT INTO workflow_steps (tenant_id, workflow_definition_id, step_order, step_name, approver_type, approver_role, sla_hours, is_auto_approved)
            VALUES (tid, w_id, 1, 'Reporting Manager Approval', 'REPORTING_MANAGER', NULL, 24, false);
        END IF;
    END LOOP;
END $$;

