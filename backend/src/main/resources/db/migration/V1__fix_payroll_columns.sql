-- ==============================================================================
-- Flyway Migration V1: Fix Payroll Columns & Constraints (PostgreSQL Compatible)
-- ==============================================================================

DO $$
BEGIN
    -- Drop legacy indexes and constraints if present
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_payroll') THEN
        ALTER TABLE payroll_slips DROP CONSTRAINT uk_payroll;
    END IF;
    DROP INDEX IF EXISTS idx_payroll_period;
    DROP INDEX IF EXISTS uk_payroll;

    -- Make legacy month and year columns nullable if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_slips') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_slips' AND column_name = 'month') THEN
            ALTER TABLE payroll_slips ALTER COLUMN "month" DROP NOT NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_slips' AND column_name = 'year') THEN
            ALTER TABLE payroll_slips ALTER COLUMN "year" DROP NOT NULL;
        END IF;

        -- Create unique constraint and index for payroll_month / payroll_year
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_slips' AND column_name = 'payroll_month') THEN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_payroll_emp_period') THEN
                ALTER TABLE payroll_slips ADD CONSTRAINT uk_payroll_emp_period UNIQUE (employee_id, payroll_month, payroll_year);
            END IF;
            CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll_slips (payroll_year, payroll_month);
        END IF;
    END IF;
END $$;
