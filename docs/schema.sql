-- ═══════════════════════════════════════════════════════
-- HRMS Platform v2.0 — Full Database Schema + Seed Data
-- MySQL 8.0+
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS hrms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hrms_db;

-- ── users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
    email                     VARCHAR(150) NOT NULL UNIQUE,
    password                  VARCHAR(255) NOT NULL,
    first_name                VARCHAR(50)  NOT NULL,
    last_name                 VARCHAR(50)  NOT NULL,
    role                      ENUM('ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE') NOT NULL,
    is_active                 BOOLEAN DEFAULT TRUE,
    email_verified            BOOLEAN DEFAULT FALSE,
    email_verify_token        VARCHAR(255),
    email_verify_expiry       DATETIME,
    password_reset_token_hash VARCHAR(255),
    password_reset_expiry     DATETIME,
    password_changed_at       DATETIME,
    failed_login_attempts     INT DEFAULT 0,
    account_locked_until      DATETIME,
    totp_secret               VARCHAR(255),
    totp_enabled              BOOLEAN DEFAULT FALSE,
    totp_backup_codes         VARCHAR(1000),
    last_login_at             DATETIME,
    last_login_ip             VARCHAR(50),
    profile_picture           VARCHAR(500),
    deleted                   BOOLEAN DEFAULT FALSE,
    created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by                VARCHAR(150),
    updated_by                VARCHAR(150),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- ── departments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(10)  UNIQUE,
    description VARCHAR(500),
    location    VARCHAR(100),
    budget      DOUBLE,
    is_active   BOOLEAN DEFAULT TRUE,
    manager_id  BIGINT,
    deleted     BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(150),
    updated_by  VARCHAR(150)
);

-- ── employees ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
    id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_number          VARCHAR(20)  NOT NULL UNIQUE,
    first_name               VARCHAR(50)  NOT NULL,
    last_name                VARCHAR(50)  NOT NULL,
    email                    VARCHAR(150) NOT NULL UNIQUE,
    phone_number             VARCHAR(15),
    alternate_phone          VARCHAR(15),
    date_of_birth            DATE,
    gender                   ENUM('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY'),
    address                  VARCHAR(255),
    city                     VARCHAR(100),
    state                    VARCHAR(100),
    pincode                  VARCHAR(10),
    country                  VARCHAR(100) DEFAULT 'India',
    designation              VARCHAR(100),
    job_title                VARCHAR(100),
    date_of_joining          DATE NOT NULL,
    date_of_confirmation     DATE,
    date_of_leaving          DATE,
    last_working_date        DATE,
    employment_status        ENUM('ACTIVE','INACTIVE','ON_LEAVE','TERMINATED','RESIGNED','PROBATION','NOTICE_PERIOD') DEFAULT 'PROBATION',
    shift_type               ENUM('MORNING','AFTERNOON','NIGHT','FLEXIBLE','ROTATIONAL') DEFAULT 'MORNING',
    salary                   DECIMAL(12,2),
    bank_account_number      VARCHAR(30),
    bank_name                VARCHAR(100),
    ifsc_code                VARCHAR(15),
    pan_number               VARCHAR(20),
    pf_number                VARCHAR(30),
    esi_number               VARCHAR(30),
    leave_balance            INT DEFAULT 24,
    sick_leave_balance       INT DEFAULT 12,
    casual_leave_balance     INT DEFAULT 8,
    emergency_contact_name   VARCHAR(100),
    emergency_contact_phone  VARCHAR(15),
    emergency_contact_relation VARCHAR(50),
    resume_url               VARCHAR(500),
    profile_picture_url      VARCHAR(500),
    user_id                  BIGINT UNIQUE,
    department_id            BIGINT,
    manager_id               BIGINT,
    deleted                  BOOLEAN DEFAULT FALSE,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by               VARCHAR(150),
    updated_by               VARCHAR(150),
    INDEX idx_emp_email   (email),
    INDEX idx_emp_dept    (department_id),
    INDEX idx_emp_number  (employee_number),
    INDEX idx_emp_status  (employment_status),
    INDEX idx_emp_manager (manager_id),
    FOREIGN KEY fk_emp_user (user_id)     REFERENCES users(id)       ON DELETE SET NULL,
    FOREIGN KEY fk_emp_dept (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

ALTER TABLE departments
    ADD CONSTRAINT fk_dept_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ── attendance ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id         BIGINT NOT NULL,
    date                DATE   NOT NULL,
    check_in_time       TIME,
    check_out_time      TIME,
    working_hours       DOUBLE,
    overtime_hours      DOUBLE,
    status              ENUM('PRESENT','ABSENT','HALF_DAY','WORK_FROM_HOME','ON_LEAVE','HOLIDAY','LATE_ARRIVAL') NOT NULL DEFAULT 'PRESENT',
    remarks             VARCHAR(500),
    late_arrival_reason VARCHAR(500),
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(150),
    updated_by          VARCHAR(150),
    UNIQUE KEY uk_att_emp_date (employee_id, date),
    INDEX idx_att_date    (date),
    INDEX idx_att_emp     (employee_id),
    INDEX idx_att_status  (status),
    FOREIGN KEY fk_att_emp (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ── leave_requests ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id       BIGINT NOT NULL,
    leave_type        ENUM('ANNUAL','SICK','CASUAL','MATERNITY','PATERNITY','UNPAID','COMPENSATORY','EMERGENCY','BEREAVEMENT') NOT NULL,
    start_date        DATE NOT NULL,
    end_date          DATE NOT NULL,
    number_of_days    INT  NOT NULL,
    reason            VARCHAR(1000) NOT NULL,
    status            ENUM('PENDING','APPROVED','REJECTED','CANCELLED','RECALLED') DEFAULT 'PENDING',
    approver_comments VARCHAR(500),
    reviewed_by       BIGINT,
    reviewed_at       DATETIME,
    attachment_url    VARCHAR(500),
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    INDEX idx_lr_emp_status (employee_id, status),
    INDEX idx_lr_dates      (start_date, end_date),
    FOREIGN KEY fk_lr_emp (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY fk_lr_reviewer (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── payroll_slips ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll_slips (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id         BIGINT NOT NULL,
    month               INT NOT NULL,
    year                INT NOT NULL,
    basic_salary        DECIMAL(12,2),
    hra                 DECIMAL(12,2),
    special_allowance   DECIMAL(12,2),
    other_allowances    DECIMAL(12,2),
    gross_salary        DECIMAL(12,2),
    pf_deduction        DECIMAL(12,2),
    professional_tax    DECIMAL(12,2),
    income_tax          DECIMAL(12,2),
    other_deductions    DECIMAL(12,2),
    total_deductions    DECIMAL(12,2),
    net_salary          DECIMAL(12,2),
    working_days        INT,
    present_days        INT,
    leave_days          INT,
    status              ENUM('DRAFT','PROCESSING','PROCESSED','PAID','FAILED') DEFAULT 'DRAFT',
    processed_at        DATETIME,
    paid_at             DATETIME,
    slip_url            VARCHAR(500),
    payment_reference   VARCHAR(100),
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(150),
    updated_by          VARCHAR(150),
    UNIQUE KEY uk_payroll (employee_id, month, year),
    INDEX idx_payroll_emp    (employee_id),
    INDEX idx_payroll_period (year, month),
    FOREIGN KEY fk_payroll_emp (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ── refresh_tokens ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME     NOT NULL,
    device_info VARCHAR(300),
    ip_address  VARCHAR(50),
    is_revoked  BOOLEAN DEFAULT FALSE,
    revoked_at  DATETIME,
    INDEX idx_rt_token  (token),
    INDEX idx_rt_user   (user_id),
    INDEX idx_rt_expiry (expiry_date),
    FOREIGN KEY fk_rt_user (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── login_history ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_history (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    login_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_at   DATETIME,
    ip_address  VARCHAR(50),
    user_agent  VARCHAR(500),
    device_type VARCHAR(30),
    browser     VARCHAR(100),
    os_name     VARCHAR(100),
    location    VARCHAR(200),
    status      VARCHAR(20) DEFAULT 'SUCCESS',
    session_id  VARCHAR(255),
    INDEX idx_lh_user_time (user_id, login_at),
    INDEX idx_lh_status    (status),
    FOREIGN KEY fk_lh_user (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── notifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     VARCHAR(1000) NOT NULL,
    type        ENUM('LEAVE_APPLIED','LEAVE_APPROVED','LEAVE_REJECTED','PAYROLL_PROCESSED',
                     'INTERVIEW_SCHEDULED','OFFER_ISSUED','TASK_ASSIGNED','REVIEW_DUE',
                     'ACCOUNT_LOCKED','BIRTHDAY','WORK_ANNIVERSARY','ANNOUNCEMENT','SYSTEM') NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    read_at     DATETIME,
    action_url  VARCHAR(500),
    entity_id   BIGINT,
    entity_type VARCHAR(50),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(150),
    updated_by  VARCHAR(150),
    INDEX idx_notif_user_read (user_id, is_read),
    INDEX idx_notif_time      (created_at),
    FOREIGN KEY fk_notif_user (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── audit_logs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50),
    entity_id    BIGINT,
    old_values   JSON,
    new_values   JSON,
    performed_by VARCHAR(150),
    ip_address   VARCHAR(50),
    request_id   VARCHAR(100),
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description  VARCHAR(500),
    module       VARCHAR(50),
    INDEX idx_al_entity (entity_type, entity_id),
    INDEX idx_al_user   (performed_by),
    INDEX idx_al_time   (performed_at)
);

-- ── performance_reviews ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performance_reviews (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id          BIGINT NOT NULL,
    reviewer_id          BIGINT,
    review_cycle         VARCHAR(50) NOT NULL,
    review_period_start  DATE,
    review_period_end    DATE,
    self_rating          INT,
    manager_rating       INT,
    final_rating         DECIMAL(3,1),
    self_comments        TEXT,
    manager_comments     TEXT,
    strengths            TEXT,
    areas_of_improvement TEXT,
    goals_next_cycle     TEXT,
    status               VARCHAR(20) DEFAULT 'PENDING',
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by           VARCHAR(150),
    updated_by           VARCHAR(150),
    FOREIGN KEY fk_pr_emp      (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY fk_pr_reviewer (reviewer_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- ── job_postings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_postings (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    requirements      TEXT,
    experience_min    INT,
    experience_max    INT,
    salary_min        DECIMAL(12,2),
    salary_max        DECIMAL(12,2),
    location          VARCHAR(100),
    status            VARCHAR(20) DEFAULT 'OPEN',
    openings          INT DEFAULT 1,
    closes_at         DATE,
    department_id     BIGINT,
    hiring_manager_id BIGINT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    FOREIGN KEY fk_jp_dept    (department_id)     REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY fk_jp_manager (hiring_manager_id) REFERENCES employees(id)  ON DELETE SET NULL
);

-- ── candidates ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_posting_id     BIGINT NOT NULL,
    name               VARCHAR(150) NOT NULL,
    email              VARCHAR(150),
    phone              VARCHAR(20),
    resume_url         VARCHAR(500),
    linkedin_url       VARCHAR(300),
    experience_years   INT,
    current_ctc        DECIMAL(12,2),
    expected_ctc       DECIMAL(12,2),
    notice_period_days INT,
    stage              ENUM('APPLIED','SCREENING','INTERVIEW_ROUND_1','INTERVIEW_ROUND_2',
                            'TECHNICAL','HR_ROUND','OFFER_PENDING','OFFER_ACCEPTED',
                            'OFFER_REJECTED','HIRED','DROPPED') DEFAULT 'APPLIED',
    source             VARCHAR(100),
    notes              TEXT,
    rejection_reason   VARCHAR(500),
    referred_by        BIGINT,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    FOREIGN KEY fk_cand_job      (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    FOREIGN KEY fk_cand_referrer (referred_by)    REFERENCES employees(id)    ON DELETE SET NULL
);

-- ════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════

-- Admin user (password = Admin@123, BCrypt encoded)
INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified)
VALUES
('admin@hrms.com',   '$2a$12$LRNiGfvHvLaEiC7XmGGpgeIb9FzLM9VVY6GYfGVvKJQjVSmPgxZnS', 'System', 'Admin',  'ROLE_ADMIN',    TRUE, TRUE),
('hr@hrms.com',      '$2a$12$LRNiGfvHvLaEiC7XmGGpgeIb9FzLM9VVY6GYfGVvKJQjVSmPgxZnS', 'Priya',  'Sharma', 'ROLE_HR',       TRUE, TRUE),
('emp@hrms.com',     '$2a$12$LRNiGfvHvLaEiC7XmGGpgeIb9FzLM9VVY6GYfGVvKJQjVSmPgxZnS', 'Rahul',  'Kumar',  'ROLE_EMPLOYEE', TRUE, TRUE),
('manager@hrms.com', '$2a$12$LRNiGfvHvLaEiC7XmGGpgeIb9FzLM9VVY6GYfGVvKJQjVSmPgxZnS', 'Vikram', 'Singh',  'ROLE_MANAGER',  TRUE, TRUE);

-- Departments
INSERT INTO departments (name, code, description, location, budget, is_active)
VALUES
('Engineering',       'ENG', 'Software development and architecture',   'Bangalore', 15000000, TRUE),
('Human Resources',   'HR',  'Talent and people operations',            'Mumbai',     4000000, TRUE),
('Finance',           'FIN', 'Financial planning and accounting',       'Delhi',      6000000, TRUE),
('Product Management','PM',  'Product strategy and roadmap',            'Bangalore',  5000000, TRUE),
('Marketing',         'MKT', 'Brand growth and digital marketing',      'Mumbai',     4500000, TRUE),
('Operations',        'OPS', 'Business operations and process',         'Hyderabad',  3500000, TRUE);

-- Employees
INSERT INTO employees (employee_number, first_name, last_name, email, phone_number, date_of_birth, gender,
    city, state, country, designation, job_title, date_of_joining, employment_status, shift_type,
    salary, leave_balance, sick_leave_balance, casual_leave_balance, department_id, user_id)
VALUES
('EMP-2024-0001','Rahul','Kumar','emp@hrms.com','9876543210','1995-06-15','MALE','Bangalore','Karnataka','India','Senior Software Engineer','Backend Developer','2022-01-10','ACTIVE','MORNING',125000,20,10,7,1,3),
('EMP-2024-0002','Priya','Sharma','hr@hrms.com','9876543211','1993-03-22','FEMALE','Mumbai','Maharashtra','India','HR Manager','People Operations','2021-05-15','ACTIVE','MORNING',95000,18,9,6,2,2),
('EMP-2024-0003','Vikram','Singh','manager@hrms.com','9876543212','1988-11-08','MALE','Bangalore','Karnataka','India','Engineering Lead','Tech Lead','2019-08-01','ACTIVE','MORNING',175000,22,11,8,1,4),
('EMP-2024-0004','Anjali','Patel','anjali.patel@hrms.com','9876543213','1997-09-14','FEMALE','Delhi','Delhi','India','Finance Manager','Senior Accountant','2020-03-15','ACTIVE','MORNING',110000,24,12,8,3,NULL),
('EMP-2024-0005','Sneha','Reddy','sneha.reddy@hrms.com','9876543214','1999-12-20','FEMALE','Hyderabad','Telangana','India','Product Manager','Associate PM','2023-07-10','PROBATION','FLEXIBLE',85000,12,6,4,4,NULL);

-- Set dept managers
UPDATE departments SET manager_id = (SELECT id FROM employees WHERE employee_number='EMP-2024-0003') WHERE code='ENG';
UPDATE departments SET manager_id = (SELECT id FROM employees WHERE employee_number='EMP-2024-0002') WHERE code='HR';
UPDATE departments SET manager_id = (SELECT id FROM employees WHERE employee_number='EMP-2024-0004') WHERE code='FIN';

-- Sample attendance
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, working_hours, status)
SELECT id, CURDATE() - INTERVAL 1 DAY, '09:00:00', '18:00:00', 9.0, 'PRESENT'
FROM employees WHERE employee_number IN ('EMP-2024-0001','EMP-2024-0002','EMP-2024-0003');

INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, working_hours, status)
SELECT id, CURDATE() - INTERVAL 2 DAY, '09:15:00', '18:30:00', 9.25, 'PRESENT'
FROM employees WHERE employee_number IN ('EMP-2024-0001','EMP-2024-0004');

-- Sample leave requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, number_of_days, reason, status)
SELECT id, 'ANNUAL', CURDATE() + INTERVAL 7 DAY, CURDATE() + INTERVAL 9 DAY, 3, 'Family vacation', 'PENDING'
FROM employees WHERE employee_number = 'EMP-2024-0001';

INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, number_of_days, reason, status)
SELECT id, 'SICK', CURDATE() - INTERVAL 10 DAY, CURDATE() - INTERVAL 9 DAY, 2, 'Fever and cold', 'APPROVED'
FROM employees WHERE employee_number = 'EMP-2024-0004';

-- Sample job posting
INSERT INTO job_postings (title, description, requirements, experience_min, experience_max, salary_min, salary_max, location, status, openings, department_id)
SELECT 'Senior Java Developer', 'Looking for experienced Java developer', 'Spring Boot, Microservices, 4+ years', 4, 8, 120000, 180000, 'Bangalore', 'OPEN', 2, id
FROM departments WHERE code = 'ENG';

-- Useful views
CREATE OR REPLACE VIEW v_employee_summary AS
SELECT e.id, e.employee_number, CONCAT(e.first_name,' ',e.last_name) AS full_name,
       e.email, e.designation, e.employment_status, e.date_of_joining,
       d.name AS department_name, e.leave_balance, e.salary, e.shift_type
FROM employees e LEFT JOIN departments d ON e.department_id = d.id
WHERE e.deleted = FALSE;

CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT e.employee_number, CONCAT(e.first_name,' ',e.last_name) AS employee_name,
       YEAR(a.date) AS year, MONTH(a.date) AS month,
       COUNT(*) AS total_days,
       SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_days,
       SUM(CASE WHEN a.status = 'ABSENT'  THEN 1 ELSE 0 END) AS absent_days,
       ROUND(AVG(a.working_hours),2) AS avg_hours
FROM attendance a JOIN employees e ON a.employee_id = e.id
GROUP BY e.id, YEAR(a.date), MONTH(a.date);
