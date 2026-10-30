-- ==============================================================================
-- V5: Phase 4 Enterprise Automation & Credential Security
-- ==============================================================================

-- 1. Add must_change_password flag to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
