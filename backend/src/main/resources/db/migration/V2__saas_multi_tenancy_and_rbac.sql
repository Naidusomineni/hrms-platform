-- ══════════════════════════════════════════════════════════════
-- V2__saas_multi_tenancy_and_rbac.sql
-- Enterprise Multi-Tenancy Engine & Dynamic RBAC Architecture
-- Compatible with PostgreSQL 16, 17, 18
-- ══════════════════════════════════════════════════════════════

-- 1. PostgreSQL Compatibility Functions
CREATE OR REPLACE FUNCTION dayofyear(d date) RETURNS integer AS $$
BEGIN
    RETURN EXTRACT(DOY FROM d)::integer;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Tenant Organizations Master Table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    domain VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE',
    logo_url VARCHAR(500),
    primary_color VARCHAR(20) DEFAULT '#2563eb',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Tenant Subscriptions Table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE',
    max_employees INT NOT NULL DEFAULT 1000,
    features JSONB,
    starts_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Dynamic Tenant Configuration / Feature Flags
CREATE TABLE IF NOT EXISTS tenant_settings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_tenant_setting UNIQUE (tenant_id, config_key)
);

-- 5. Granular Permissions Catalog
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Dynamic Tenant Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_tenant_role UNIQUE (tenant_id, name)
);

-- 7. Role to Permission Mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 8. User to Role Mapping
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 9. Add tenant_id Discriminator Column to Core Business Tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE departments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE performance_reviews ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- 10. High-Performance Multi-Tenant Compound Indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_emp_tenant_status ON employees(tenant_id, employment_status);
CREATE INDEX IF NOT EXISTS idx_emp_tenant_number ON employees(tenant_id, employee_number);
CREATE INDEX IF NOT EXISTS idx_dept_tenant_code ON departments(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_att_tenant_emp_date ON attendance(tenant_id, employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leaves_tenant_emp ON leave_requests(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_tenant_period ON payroll_slips(tenant_id, employee_id, payroll_year, payroll_month);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON audit_logs(tenant_id, performed_at);
CREATE INDEX IF NOT EXISTS idx_notif_tenant_user ON notifications(tenant_id, user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);

-- 11. Seed Default Primary Tenant
INSERT INTO tenants (id, code, name, domain, status, subscription_tier, primary_color)
VALUES ('default', 'DEFAULT', 'Global Enterprise Platform', 'localhost', 'ACTIVE', 'ENTERPRISE', '#2563eb')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;

INSERT INTO tenant_subscriptions (tenant_id, plan_name, max_employees, starts_at, status)
VALUES ('default', 'ENTERPRISE', 5000, NOW(), 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 12. Seed Granular Permissions Catalog
INSERT INTO permissions (name, category, description) VALUES
    ('USER_READ', 'USER', 'View users list and profile information'),
    ('USER_WRITE', 'USER', 'Create and modify user accounts'),
    ('USER_DELETE', 'USER', 'Deactivate or delete user accounts'),
    ('EMPLOYEE_READ', 'EMPLOYEE', 'View employee records'),
    ('EMPLOYEE_WRITE', 'EMPLOYEE', 'Add or update employee information'),
    ('EMPLOYEE_DELETE', 'EMPLOYEE', 'Archive or delete employee records'),
    ('DEPARTMENT_READ', 'DEPARTMENT', 'View departments and organization structure'),
    ('DEPARTMENT_WRITE', 'DEPARTMENT', 'Manage departments and budgets'),
    ('ATTENDANCE_READ', 'ATTENDANCE', 'View attendance logs and timesheets'),
    ('ATTENDANCE_WRITE', 'ATTENDANCE', 'Mark and modify attendance records'),
    ('LEAVE_READ', 'LEAVE', 'View leave balances and requests'),
    ('LEAVE_APPLY', 'LEAVE', 'Submit leave applications'),
    ('LEAVE_APPROVE', 'LEAVE', 'Approve or reject leave applications'),
    ('PAYROLL_READ', 'PAYROLL', 'View payroll slips and history'),
    ('PAYROLL_PROCESS', 'PAYROLL', 'Run and approve payroll calculations'),
    ('RECRUITMENT_MANAGE', 'RECRUITMENT', 'Manage job postings and applicants'),
    ('PERFORMANCE_MANAGE', 'PERFORMANCE', 'Conduct performance reviews and appraisals'),
    ('AUDIT_VIEW', 'AUDIT', 'View system audit trails and security logs'),
    ('SETTINGS_MANAGE', 'SETTINGS', 'Configure tenant and platform settings'),
    ('SYSTEM_ADMIN', 'SYSTEM', 'Full system administration access')
ON CONFLICT (name) DO NOTHING;

-- 13. Seed Standard Roles for Default Tenant
INSERT INTO roles (tenant_id, name, description, is_system_role) VALUES
    ('default', 'ROLE_SUPER_ADMIN', 'Platform Administrator with complete access', TRUE),
    ('default', 'ROLE_ADMIN', 'Tenant Administrator with management capabilities', TRUE),
    ('default', 'ROLE_HR', 'HR Professional managing employee lifecycle', TRUE),
    ('default', 'ROLE_MANAGER', 'Team Manager managing reports, approvals and timesheets', TRUE),
    ('default', 'ROLE_EMPLOYEE', 'Standard Employee self-service role', TRUE)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- 14. Assign Permissions to Roles for Default Tenant
-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.tenant_id = 'default' AND r.name = 'ROLE_SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- ADMIN gets all except SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.tenant_id = 'default' AND r.name = 'ROLE_ADMIN'
  AND p.name != 'SYSTEM_ADMIN'
ON CONFLICT DO NOTHING;

-- HR gets HR operations
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.tenant_id = 'default' AND r.name = 'ROLE_HR'
  AND p.name IN ('USER_READ', 'EMPLOYEE_READ', 'EMPLOYEE_WRITE', 'DEPARTMENT_READ', 'ATTENDANCE_READ', 'ATTENDANCE_WRITE', 'LEAVE_READ', 'LEAVE_APPROVE', 'PAYROLL_READ', 'PAYROLL_PROCESS', 'RECRUITMENT_MANAGE', 'PERFORMANCE_MANAGE')
ON CONFLICT DO NOTHING;

-- MANAGER gets team supervision
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.tenant_id = 'default' AND r.name = 'ROLE_MANAGER'
  AND p.name IN ('EMPLOYEE_READ', 'ATTENDANCE_READ', 'LEAVE_READ', 'LEAVE_APPROVE', 'PERFORMANCE_MANAGE')
ON CONFLICT DO NOTHING;

-- EMPLOYEE gets self-service
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.tenant_id = 'default' AND r.name = 'ROLE_EMPLOYEE'
  AND p.name IN ('EMPLOYEE_READ', 'ATTENDANCE_READ', 'LEAVE_READ', 'LEAVE_APPLY', 'PAYROLL_READ')
ON CONFLICT DO NOTHING;

-- 15. Bind existing users to their corresponding roles in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.tenant_id = u.tenant_id AND r.name = u.role::text
ON CONFLICT DO NOTHING;
