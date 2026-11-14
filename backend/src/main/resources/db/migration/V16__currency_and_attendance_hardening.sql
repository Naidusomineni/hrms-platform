-- V16: Enterprise Dynamic Currency and Multi-Tenant Payroll Hardening

ALTER TABLE payroll_slips ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';

