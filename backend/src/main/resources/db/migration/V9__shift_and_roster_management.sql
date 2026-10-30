-- ==============================================================================
-- V9: Phase 4 Milestone 4 - Enterprise Shift & Roster Management
-- ==============================================================================

-- 1. Shifts Definition Table
CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    name VARCHAR(100) NOT NULL,
    shift_code VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_mins INTEGER NOT NULL DEFAULT 15,
    break_duration_mins INTEGER NOT NULL DEFAULT 60,
    is_night_shift BOOLEAN NOT NULL DEFAULT FALSE,
    night_allowance_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_shifts_tenant_code UNIQUE (tenant_id, shift_code)
);

CREATE INDEX IF NOT EXISTS idx_shifts_tenant ON shifts(tenant_id, is_active);

-- 2. Roster Schedule Assignments Table (Mapping employee to shift on specific dates)
CREATE TABLE IF NOT EXISTS roster_assignments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id BIGINT NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
    effective_date DATE NOT NULL,
    rotation_pattern VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    assigned_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_roster_emp_date UNIQUE (tenant_id, employee_id, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_roster_tenant_date ON roster_assignments(tenant_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_roster_emp_date ON roster_assignments(tenant_id, employee_id, effective_date);

-- 3. Peer-to-Peer Shift Swap Workflow Table
CREATE TABLE IF NOT EXISTS shift_swap_requests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    requester_employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    target_employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    requester_roster_id BIGINT NOT NULL REFERENCES roster_assignments(id) ON DELETE CASCADE,
    target_roster_id BIGINT NOT NULL REFERENCES roster_assignments(id) ON DELETE CASCADE,
    swap_date DATE NOT NULL,
    reason TEXT NOT NULL,
    peer_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PEER',       -- PENDING_PEER, PEER_ACCEPTED, PEER_REJECTED
    manager_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_MANAGER', -- PENDING_MANAGER, APPROVED, REJECTED
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',                 -- PENDING, APPROVED, REJECTED, CANCELLED
    reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    manager_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_swap_tenant_status ON shift_swap_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_swap_requester ON shift_swap_requests(tenant_id, requester_employee_id);
CREATE INDEX IF NOT EXISTS idx_swap_target ON shift_swap_requests(tenant_id, target_employee_id);

-- Seed default enterprise shifts for default tenant
INSERT INTO shifts (tenant_id, name, shift_code, start_time, end_time, grace_period_mins, break_duration_mins, is_night_shift, night_allowance_rate)
VALUES 
    ('default', 'General Day Shift (HQ)', 'GEN_0918', '09:00:00', '18:00:00', 15, 60, FALSE, 0.00),
    ('default', 'Morning Early Shift', 'MORN_0615', '06:00:00', '15:00:00', 15, 60, FALSE, 150.00),
    ('default', 'Overnight Shift (24/7 Ops)', 'NIGHT_2106', '21:00:00', '06:00:00', 15, 60, TRUE, 500.00)
ON CONFLICT (tenant_id, shift_code) DO NOTHING;
