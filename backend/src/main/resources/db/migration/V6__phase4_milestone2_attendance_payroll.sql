-- ==============================================================================
-- V6: Phase 4 Milestone 2 - Smart Attendance & Biometric Integration
-- ==============================================================================

-- 1. Upgrade attendance table with source tracking, break timers, and work modes
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS punch_source VARCHAR(50) DEFAULT 'WEB_MANUAL';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS is_on_break BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS last_break_start TIMESTAMP;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS work_mode VARCHAR(30) DEFAULT 'OFFICE';

-- 2. Biometric Devices Registry
CREATE TABLE IF NOT EXISTS biometric_devices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    device_code VARCHAR(50) NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(150),
    updated_by VARCHAR(150),
    CONSTRAINT uk_biometric_device UNIQUE (tenant_id, device_code)
);

CREATE INDEX IF NOT EXISTS idx_biometric_tenant ON biometric_devices (tenant_id);

-- 3. Seed sample biometric devices
INSERT INTO biometric_devices (tenant_id, device_code, device_name, location, is_active, created_at)
VALUES
    ('default', 'GATE-01', 'HQ Main Entrance Turnstile (Face/RFID)', 'Ground Floor Lobby', TRUE, NOW()),
    ('default', 'GATE-02', 'Engineering Block Turnstile (Fingerprint)', 'Building B Turnstile', TRUE, NOW())
ON CONFLICT (tenant_id, device_code) DO NOTHING;
