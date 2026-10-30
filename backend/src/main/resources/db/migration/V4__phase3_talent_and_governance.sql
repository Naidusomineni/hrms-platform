-- ============================================================================
-- V4: Phase 3 - Enterprise Talent, Governance, Assets & Analytics
-- ============================================================================

-- 1. APPRAISAL CYCLES
CREATE TABLE IF NOT EXISTS appraisal_cycles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'GOAL_SETTING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_appraisal_cycles_tenant ON appraisal_cycles (tenant_id, status);

-- 2. EMPLOYEE GOALS / OKRs
CREATE TABLE IF NOT EXISTS employee_goals (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    cycle_id BIGINT REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metric_target VARCHAR(100),
    metric_current VARCHAR(100),
    weightage INT DEFAULT 25,
    progress INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employee_goals_tenant ON employee_goals (tenant_id, employee_id, cycle_id);

-- 3. INTERVIEW SCORECARDS
CREATE TABLE IF NOT EXISTS interview_scorecards (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    candidate_id BIGINT REFERENCES candidates(id) ON DELETE CASCADE,
    interviewer_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    round_name VARCHAR(100) NOT NULL,
    technical_rating INT DEFAULT 3,
    communication_rating INT DEFAULT 3,
    culture_fit_rating INT DEFAULT 3,
    recommendation VARCHAR(50) NOT NULL DEFAULT 'HIRE',
    feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_tenant ON interview_scorecards (tenant_id, candidate_id);

-- 4. ASSETS MASTER INVENTORY
CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    asset_tag VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    cost DECIMAL(12,2),
    condition_status VARCHAR(50) DEFAULT 'GOOD',
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets (tenant_id, asset_tag);

-- 5. ASSET ALLOCATIONS
CREATE TABLE IF NOT EXISTS asset_allocations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    asset_id BIGINT REFERENCES assets(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    allocated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP,
    allocation_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_asset_allocations_tenant ON asset_allocations (tenant_id, employee_id, allocation_status);

-- 6. TAX DECLARATIONS & COMPLIANCE
CREATE TABLE IF NOT EXISTS tax_declarations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    financial_year VARCHAR(20) NOT NULL,
    regime VARCHAR(20) NOT NULL DEFAULT 'NEW',
    declared_80c DECIMAL(12,2) DEFAULT 0.00,
    declared_80d DECIMAL(12,2) DEFAULT 0.00,
    declared_hra DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tax_declarations_tenant ON tax_declarations (tenant_id, employee_id, financial_year);
