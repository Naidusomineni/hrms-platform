-- ====================================================================
-- HRMS Platform Migration: V10__workforce_intelligence_and_ai.sql
-- Phase 4 Milestone 5: Generative HR Assistant & Workforce Intelligence
-- ====================================================================

-- 1. Corporate HR Policy Knowledge Base
CREATE TABLE IF NOT EXISTS hr_policy_articles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    category VARCHAR(60) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords VARCHAR(500),
    action_label VARCHAR(100),
    action_route VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    updated_by VARCHAR(150)
);

CREATE INDEX IF NOT EXISTS idx_hr_policy_tenant_cat ON hr_policy_articles(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_hr_policy_tenant_active ON hr_policy_articles(tenant_id, is_active);

-- 2. Predictive Workforce Attrition & Flight Risk Radar
CREATE TABLE IF NOT EXISTS flight_risk_evaluations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    primary_driver VARCHAR(100) NOT NULL,
    driver_breakdown TEXT,
    retention_recommendation TEXT NOT NULL,
    evaluated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    updated_by VARCHAR(150)
);

CREATE INDEX IF NOT EXISTS idx_flight_risk_tenant_lvl ON flight_risk_evaluations(tenant_id, risk_level);
CREATE INDEX IF NOT EXISTS idx_flight_risk_emp ON flight_risk_evaluations(tenant_id, employee_id);

-- 3. Seed Enterprise HR Policies for Tenant 'default'
INSERT INTO hr_policy_articles (tenant_id, category, title, summary, content, keywords, action_label, action_route, is_active, created_by)
VALUES
(
    'default',
    'LEAVE_AND_TIME_OFF',
    'Annual Paid Time Off & Sick Leave Encashment Policy',
    'Enterprise guidelines regarding annual privilege leaves, casual leaves, sick leave accumulation, and rollover limits.',
    'Employees accrue 1.75 privilege leaves (PL) per completed calendar month, totaling 21 PLs per annum. A maximum of 15 unused PLs can be carried forward into the subsequent calendar year. Accumulated balances beyond 15 days are eligible for encashment during the annual March payroll or upon separation. Sick leave (10 days/annum) requires a medical certificate if consecutive absence exceeds 3 days.',
    'leave, annual leave, sick leave, rollover, encashment, privilege leave, casual leave, time off, pto, vacation',
    'Apply for Leave',
    '/leaves',
    TRUE,
    'SYSTEM'
),
(
    'default',
    'HEALTH_AND_INSURANCE',
    'Group Health Insurance & Family Floater Scheme',
    'Comprehensive corporate medical insurance covering inpatient hospitalisation, maternity benefits, and pre-existing ailments.',
    'All confirmed full-time staff and their declared dependents (spouse, up to 2 children) are insured under the Tier-1 Group Mediclaim Floater Policy up to INR 7,50,000 per family unit. Cashless hospitalisation is supported across 9,000+ networked hospitals nationwide via MediBuddy/Paramount TPA. Critical illness supplemental cover and parental add-on schemes can be opted during the annual benefits open enrollment window in April.',
    'insurance, health, medical, mediclaim, hospitalisation, tpa, cashless, dependents, parents, maternity cover, policy',
    'View Benefits',
    '/documents',
    TRUE,
    'SYSTEM'
),
(
    'default',
    'STATUTORY_AND_TAX',
    'Indian Statutory Tax Regimes (New vs Old) & Declarations',
    'Regulatory tax deductions, HRA exemptions, Section 80C/80D investment proofs, and regime switching guidelines.',
    'The New Tax Regime (Section 115BAC) serves as the default payroll withholding framework, featuring concessional tax slabs and standard deduction of INR 75,000. Employees wishing to declare under the Old Tax Regime must submit Rent Receipts (HRA under Sec 10(13A)), Home Loan Interest (Sec 24b), 80C instruments (PPF, ELSS, EPF up to INR 1.5L), and Medical Premium (80D up to INR 25K) before the statutory cut-off date (January 15). Form 16 Part A and B are issued by May 31.',
    'tax, income tax, new regime, old regime, 80c, 80d, hra, tds, form 16, deductions, investment declaration, slab',
    'Manage Tax Declarations',
    '/payroll',
    TRUE,
    'SYSTEM'
),
(
    'default',
    'ATTENDANCE_AND_SHIFTS',
    'Rotational Shift Allowances & Shift Swap Protocols',
    'Standard operational hours, overnight shift compensations, and mutual peer swap rules.',
    'The standard workday comprises 9 operational hours including 60 minutes of breaks. Employees designated to the Night Shift (21:00 - 06:00) receive an automated Night Differential Allowance of INR 500 per logged shift, credited through monthly payroll. Shift swap requests require mutual peer acceptance followed by reporting manager sign-off at least 24 hours prior to shift commencement.',
    'shift, night shift, allowance, roster, swap, rotational, working hours, attendance, night allowance, timing',
    'View Team Roster',
    '/shifts',
    TRUE,
    'SYSTEM'
),
(
    'default',
    'COMPENSATION_AND_BENEFITS',
    'Gratuity Eligibility & Statutory Severance Computation',
    'Statutory formula and qualification criteria under Payment of Gratuity Act, 1972.',
    'In compliance with the Payment of Gratuity Act, employees completing at least 4 years and 240 days of continuous service qualify for statutory gratuity upon retirement, resignation, or superannuation. Gratuity is calculated strictly using the formula: (15 * Last Drawn Basic Salary * Completed Years of Service) / 26. Gratuity up to INR 20,00,000 is fully exempt from income tax.',
    'gratuity, settlement, severance, resignation, retirement, basic salary, calculation, tenure, offboarding',
    'Offboarding Portal',
    '/offboarding',
    TRUE,
    'SYSTEM'
),
(
    'default',
    'CODE_OF_CONDUCT',
    'POSH Policy (Prevention of Sexual Harassment at Workplace)',
    'Zero-tolerance guidelines, Internal Committee (IC) constitution, and confidential redressal channels.',
    'The organization upholds a zero-tolerance policy against any form of sexual harassment or discriminatory conduct at physical premises or digital workplaces. Complaints may be submitted in strict confidentiality directly to the Internal Committee (IC) via the Helpdesk portal or via email at posh@corporate.hrms. The committee is bound to initiate preliminary inquiry within 7 business days and conclude comprehensive hearings within 90 calendar days.',
    'posh, harassment, grievance, safety, code of conduct, internal committee, ethics, discrimination, complaint',
    'Raise Confidential Ticket',
    '/helpdesk',
    TRUE,
    'SYSTEM'
)
ON CONFLICT DO NOTHING;
