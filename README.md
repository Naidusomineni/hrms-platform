# 🏢 HRMS Platform v2.5 — Enterprise Edition

> A production-grade Human Resource Management System built with Spring Boot 3.2.3 (Java 21 LTS), React 18 SPA, PostgreSQL 18 & 16, Redis, JWT with Silent Refresh Token Rotation, WebSocket notifications, Workforce Intelligence & Generative AI, and full DevOps setup.

[![Java 21](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18%20%7C%2016-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black?logo=githubactions)](https://github.com/Naidusomineni/hrms-platform/actions)

---

## 📋 Table of Contents

1. [What's New in v2.5](#whats-new)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Quick Start](#quick-start)
6. [Manual Setup](#manual-setup)
7. [Docker Deployment](#docker)
8. [API Reference](#api)
9. [Default Credentials](#credentials)
10. [Environment Variables](#env)
11. [CI/CD Pipeline](#cicd)
12. [Project Structure](#structure)
13. [Testing & Quality Assurance](#testing)
14. [Security & Edge-Case Defenses](#security)

---

## 🆕 What's New in v2.5 <a name="whats-new"></a>

| Category | New Production Enhancements & Capabilities |
| :--- | :--- |
| **Configurable Policy Engine** | Hierarchical 4-tier attendance resolution: `Employee (Tier 1)` $\rightarrow$ `Department (Tier 2)` $\rightarrow$ `Office Location (Tier 3)` $\rightarrow$ `Tenant Default (Tier 4)`. Configurable punch channels (`BIOMETRIC`, `WEB`, `GEOFENCE`), grace periods (15m, 30m), late mark forgiveness limits, penalties (`FLAG_ONLY`, `DEDUCT_HALF_DAY`, `DEDUCT_LEAVE`, `LOSS_OF_PAY`), and filing windows |
| **Tenant Module Manifest & Feature Flags** | Dedicated B2B subscription manifest allowing tenants to dynamically enable or disable any of the 20 platform modules (`DASHBOARD`, `ATTENDANCE`, `PAYROLL`, `RECRUITMENT`, `INTELLIGENCE`, etc.). Sidebar automatically filters navigation menus based on live tenant feature flags |
| **Universal Request & Approvals Hub** | Centralized self-service portal (`/requests`) supporting Missed Punch Regularization, Work From Home (WFH), On-Duty / Client Visits, Overtime Pre-Authorization, and Expense Claims with atomic date-level conflict prevention blocking overlapping requests |
| **Approvals Command Center & Delegation** | Multi-tier sequential approval engine (`REPORTING_MANAGER` $\rightarrow$ `DEPARTMENT_HEAD` $\rightarrow$ `ROLE_HR`) with SLA deadlines (24h/48h), 1-click batch actions, and Out-of-Office manager delegation routing approvals without SLA bottlenecks |
| **Dedicated Policy Hub UI (`/policies`)** | High-contrast B2B SaaS command center: 4 tabs covering Attendance Policy Editor, Policy Assignment Matrix, Tenant Module Subscriptions, and Approval Delegations |
| **Master Deep Verification Suite** | 67/67 automated end-to-end integration and Playwright browser tests passing (`scripts/master-e2e-deep-test.js` & `scripts/e2e-suite.js`), verifying all personas and 21 modules |

---

## 🛠️ Tech Stack <a name="tech-stack"></a>

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| Spring Boot | 3.2.3 | Core application framework & REST controllers |
| Java | 21 (LTS) | Runtime with virtual threads & modern language features |
| Spring Security 6 | 3.2.3 | Stateless JWT filter chain, role-based authorization (RBAC) |
| Spring Data JPA | 3.2.3 | Tenant-isolated repository persistence & pagination |
| Spring WebSocket | 3.2.3 | Real-time push notifications (STOMP over SockJS) |
| PostgreSQL | 18 / 16 | Primary multi-tenant relational database (55 tables) |
| Flyway | 10.5.0 | Database schema migrations (V1–V11) |
| Redis | 7.2 | Distributed token blacklisting & session invalidation |
| JJWT | 0.11.5 | HMAC-SHA256 JWT access & refresh token rotation |
| Bucket4j | 8.10.1 | In-memory token-bucket IP rate limiter (120 req/min) |
| Thymeleaf | 3.x | Corporate branded HTML email templates |
| Lombok | 1.18.30 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.3.0 | Interactive Swagger UI API documentation |
| Micrometer Prometheus | Latest | Application telemetry, metrics & health endpoints |
| Maven | 3.9.6 | Build descriptor & dependency manager |

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| React | 18.3.1 | Component-based UI library |
| TypeScript | 5.8 / 7.0 | Strict compile-time type safety & domain models |
| Vite | 5.4.21 | High-speed frontend bundler with HMR |
| Redux Toolkit | 2.2.3 | Centralized state store with typed hooks (`useAppSelector`, `useAppDispatch`) |
| React Router | 6.22 | Client-side routing with role-guarded `ProtectedRoute.tsx` |
| Axios | 1.6.8 | HTTP client with automatic silent JWT refresh interceptors |
| Tailwind CSS | 3.4.3 | Utility-first Corporate SaaS design system |
| Lucide React | 0.378 | Vector SVG iconography |
| Playwright | 1.60.0 | Headless browser end-to-end regression automation |
| LiveKit Client | 2.23.0 | Real-time WebRTC audio/video interview streaming |
| jsPDF / autoTable | 2.5 | Client-side vector PDF generation (Payslips, Relieving Letters) |
| Recharts | 2.12 | Executive charts & data visualizations |
| @stomp/stompjs | 7.0 | WebSocket real-time event listener |
| date-fns | 3.6 | Date arithmetic & formatting |

---

## ✨ Features <a name="features"></a>

### 🏢 SaaS Multi-Tenancy
- [x] Header-based tenant resolution (`X-Tenant-ID`) with subdomain and query parameter fallbacks
- [x] Subdomain Host header resolution (e.g. `eoxys.localhost` or `acme.hrms.com`)
- [x] Dynamic white-labeling: custom logos, primary brand colors (`#HEX`), and company names
- [x] ThreadLocal isolation via `TenantContextFilter` with mandatory `finally { TenantContext.clear(); }`
- [x] Defense-in-depth: `BaseTenantEntity` automatically scopes all 55 database entities
- [x] Banned unbounded `findAll()` database queries across all repositories

### 🔐 Authentication & Enterprise Security
- [x] Stateless JWT Access Token (15 min) + Refresh Token Rotation (7 days)
- [x] BCrypt password hashing (cost factor 12)
- [x] Progressive account lockout after 5 consecutive failed attempts (30 min lockout)
- [x] Mandatory first-login password enforcement (`mustChangePassword: true`)
- [x] Auto-generation of secure temporary onboarding credentials (`Hrms@<4-digit-random>`)
- [x] Forgot password with 6-digit OTP (BCrypt-hashed, 15-min expiry, 60s resend cooldown)
- [x] Denial of Service (DoS) rate limiting via Bucket4j (120 req/min per client IP)
- [x] Bank-grade RFC 6238 Two-Factor Authentication (2FA / TOTP) compatible with Google Authenticator & Authy
- [x] Single-use encrypted backup recovery codes (8 emergency keys)
- [x] Distributed token blacklisting and session invalidation via Redis

### 💼 Recruitment & Smart ATS (with 1-Click Onboard)
- [x] Job opening requisitions and public job postings management
- [x] 6-stage applicant tracking pipeline: `APPLIED` → `SCREENING` → `TECH 1` → `FINAL ROUND` → `OFFER PENDING` → `HIRED`
- [x] **1-Click Candidate Onboard**: Single click converts candidate to active `Employee` record, provisions User credentials, seeds leave quotas, updates ATS stage, and triggers Welcome Email
- [x] Deterministic sequential Employee ID generation (`EMP-YYYY-XXXX`)
- [x] Native WebRTC live video interview rooms with collaborative code compiler and evaluation rubrics
- [x] Automated stage advancement email notifications with dynamic interview feedback

### 👥 Employee Management & Directory
- [x] Master employee directory with multi-field search, department filtering, and pagination
- [x] Full CRUD operations with soft delete and multi-tenant scoping
- [x] Initial statutory leave balance seeding upon creation (24 Annual, 12 Sick, 8 Casual)
- [x] Profile picture upload with fallback to initials badge on 404
- [x] Encrypted document vault for contracts, PAN, and identity proofs
- [x] Emergency contact records, designation hierarchies, and bank disbursement details

### 📅 Attendance, Shift Roster & Punch Management
- [x] **Master Daily Attendance Register**: Single-pane enterprise view displaying real-time company headcount KPIs (`Total Scheduled`, `Present On-Time`, `Late Arrivals`, `On Break`, `Remote / WFH`, `Absent / No Punch`), search by employee code/name, and department filters.
- [x] **Admin Punch Adjustment ("Adjust Punch")**: Direct row-level action allowing HR Admins and Managers to adjust employee **Check-In Time (Login)**, **Check-Out Time (Logout)**, and status with automatic net working hours recalculation, overtime detection, and mandatory compliance audit logging (`PUT /v1/attendance/{id}`).
- [x] **Admin Punch Entry ("Mark Attendance")**: Create new attendance entries with native 24h/12h time pickers for Login and Logout, auto-calculated duration preview, and status assignment.
- [x] **Employee Missed Punch Correction**: Self-service time correction request allowing employees to submit actual Login/Logout times with reason categories (`Hardware Glitch`, `Forgot Badge`, `Client On-Site Visit`) for manager approval within configured policy filing windows.
- [x] **Real-time Shift Stopwatch**: Live workday session tracker with elapsed time counter (`HH:MM:SS`), break pause toggles, and 8-hour progress bar with Half-Day (4h) and Standard (8h) milestones.
- [x] **Corporate Worksite Geofencing**: Automatic GPS perimeter validation against registered company campuses without clumsy manual location selectors.
- [x] **Physical Biometric Turnstiles**: Hardware turnstile REST push webhook (`/v1/attendance/biometric-sync`), fleet status registry, and bulk CSV punch ingestion.
- [x] **Policy-Driven Punctuality**: Expected shift timings (`09:00 AM – 06:00 PM`) with 15-minute grace window (late arrival cutoff at 09:15 AM) and monthly late mark allowances.
- [x] Net Working Hours Formula: `workingHours = Math.max(0.0, (totalMinutes - breakMinutes) / 60.0)`
- [x] Half-Day Trigger: `workingHours < 4.0` shifts status automatically to `HALF_DAY`
- [x] Overtime Calculation: `overtimeHours = Math.max(0.0, workingHours - 8.0)`
- [x] Precision Geo-Fenced Mobile & Web GPS punch: Haversine distance validation against office geofence

### 🔄 Shift & Roster Management
- [x] Enterprise shift definitions: Morning, Afternoon, General, and Overnight Night shifts
- [x] Grace period thresholds (15 mins) and night differential allowance rates
- [x] Weekly team roster calendar matrix with date-range filters
- [x] 2-tier shift swap state machine: mutual peer consent (`PEER_ACCEPTED`) followed by manager approval
- [x] Cross-midnight shift support: check-out punches linked to shift date rather than calendar date

### 🏖️ Leave Management
- [x] 9 statutory leave types: Annual, Sick, Casual, Maternity, Paternity, Unpaid, Comp-Off, Emergency, Bereavement
- [x] Live balance ledgers per employee with annual allocation tracking
- [x] Apply, approve, reject, and cancellation workflows with notification triggers
- [x] Calendar overlap prevention and automatic weekend exclusion

### 🧾 Expense Claims & Business Reimbursements
- [x] Corporate employee claim submission across 7 categories (Travel, Meals, Broadband, Supplies, Fuel, Certifications)
- [x] Receipt attachment upload and audit tracking
- [x] 2-Stage approval workflow: Reporting Manager Review → Finance Department Audit
- [x] **Automated Payroll Bridge**: Approved expense claims automatically sync into monthly payroll net pay
- [x] Real-time claim status tracking: `SUBMITTED`, `MANAGER_APPROVED`, `FINANCE_APPROVED`, `DISBURSED`, `REJECTED`

### 💰 Statutory Payroll & Compensation
- [x] 1-Click batch payroll calculation across all active employees
- [x] Prorated Gross calculation based on working days vs effective present days
- [x] MNC standard breakdown: Basic (50%), HRA (20%), Special Allowance (30%)
- [x] Statutory deductions: Employee Provident Fund (12% of Basic), Professional Tax (₹200/mo, ₹300 in Feb), TDS (5% for > ₹50,000)
- [x] Non-taxable business expense reimbursement integration into net pay
- [x] 1-Click vector PDF payslip generator with embedded verification QR code, digital seal, and Indian rupee words
- [x] Corporate bank batch disbursement CSV export (NEFT / RTGS)

### 🚪 Offboarding & Full & Final (F&F) Settlement
- [x] Resignation submission and separation review workflow in ESS
- [x] 4-department clearance NOC: IT Assets, Finance Dues, HR Admin, Reporting Manager
- [x] Statutory Gratuity calculation engine: `(15 * Basic * Tenure) / 26` (tenure >= 5 yrs)
- [x] Leave encashment formula: `(Accumulated Leaves * Basic) / 30`
- [x] Vector PDF generation for official Relieving Letters, Experience Certificates, and F&F Statements
- [x] Automatic transition of employee status to `TERMINATED` upon disbursement

### 🧠 Workforce Intelligence & AI Copilot
- [x] Natural language AI HR Assistant with semantic RAG intent matching
- [x] Pre-seeded corporate knowledge base: Leave rollovers, Group Mediclaim, Tax slabs, POSH guidelines, Shift rules
- [x] Instant answer generation with confidence scores, policy citations, and action links
- [x] Predictive workforce attrition flight risk radar evaluating attendance volatility, compensation stagnation, and tenure
- [x] Smart ATS candidate match scorecard with skills overlap and hiring recommendations

### 💻 IT Assets & Service Desk
- [x] IT asset inventory catalog (Laptops, monitors, mobile devices, licenses)
- [x] Asset allocation to employees with condition tracking and return records
- [x] Direct link with offboarding NOC clearance for asset recovery
- [x] Internal support ticketing with SLA countdown deadlines and diagnostic engineer comments

---

## 🏛️ Architecture <a name="architecture"></a>

```
Client Tier (React 18 SPA + TypeScript + Vite + Tailwind CSS)
      │
      ▼
Nginx Reverse Proxy / SSL Termination (Port 80 / 443)
      │
      ├── /api/** ──── Spring Boot 3.2.3 (Port 8080)
      │                      │
      │               ┌──────┴──────────────────────────┐
      │               │   Filter Chain                  │
      │               │   ├─ RequestIdFilter (MDC UUID) │
      │               │   ├─ TenantContextFilter        │
      │               │   ├─ RateLimitFilter (Bucket4j) │
      │               │   └─ JwtAuthenticationFilter    │
      │               │                                 │
      │               │   @RestControllers (/v1/)       │
      │               │   ├─ /v1/auth                   │
      │               │   ├─ /v1/employees              │
      │               │   ├─ /v1/attendance             │
      │               │   ├─ /v1/shifts                 │
      │               │   ├─ /v1/leaves                 │
      │               │   ├─ /v1/payroll                │
      │               │   ├─ /v1/expenses               │
      │               │   ├─ /v1/recruitment            │
      │               │   ├─ /v1/offboarding            │
      │               │   ├─ /v1/intelligence           │
      │               │   ├─ /v1/helpdesk               │
      │               │   └─ /v1/communication          │
      │               │                                 │
      │               │   Transactional Business Core   │
      │               │   └─ @Transactional Services    │
      │               │                                 │
      │               │   Persistence & Data Access     │
      │               │   └─ Spring Data JPA / HikariCP │
      │               └─────────────────────────────────┘
      │                        │
      │              ┌─────────┼──────────┐
      │              ▼         ▼          ▼
      │        PostgreSQL 18  Redis 7.2  Persistent Disk
      │          (hrms_db)   (Blacklist)  (/storage)
      │
      └── /ws ────── Spring WebSocket (STOMP over SockJS)
                           │
                      Real-time push notifications
                      to active corporate sessions
```

---

## ⚡ Quick Start (Docker) <a name="quick-start"></a>

```bash
# 1. Clone the repository
git clone https://github.com/Naidusomineni/hrms-platform.git
cd hrms-platform

# 2. Configure environment variables (optional - defaults pre-configured)
cp .env.example .env

# 3. Start complete multi-container stack
docker compose up -d --build

# 4. Access applications
open http://localhost                                  # Frontend Application
open http://localhost:8080/api/swagger-ui/index.html   # Swagger API Documentation
open http://localhost:3000                             # Grafana Monitoring
```

---

## 🔧 Manual Setup <a name="manual-setup"></a>

### Prerequisites
| Tool | Version |
| :--- | :--- |
| JDK | 21 (LTS) |
| Maven | 3.9+ |
| Node.js | 20+ |
| PostgreSQL | 18 or 16 |
| Redis | 7+ (optional for local dev) |

### 1. PostgreSQL Setup
Using `psql` or pgAdmin, create the application database:
```sql
CREATE DATABASE hrms_db;
```
*(Default local credentials: port `5433` or `5432`, user `postgres`, password `Naidu@98666` or configured in `application.properties`).*

### 2. Configure Backend
Ensure database credentials match in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/hrms_db
spring.datasource.username=postgres
spring.datasource.password=Naidu@98666
server.servlet.context-path=/api
```

### 3. Start Backend
```powershell
cd backend
mvn clean package -DskipTests
java -jar target/hrms-platform-2.0.0.jar
```
*Health endpoint: `http://localhost:8080/api/actuator/health`*  
*Swagger UI: `http://localhost:8080/api/swagger-ui/index.html`*

### 4. Start Frontend
```powershell
cd frontend
npm install
npm run dev -- --host
```
*Frontend application: `https://localhost:5173`*

---

## 📡 API Reference <a name="api"></a>

All API endpoints are prefixed with `/api/v1/` and resolve organization multi-tenancy via `X-Tenant-ID` header.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/login` | Public | Authenticate user, return access + refresh tokens |
| POST | `/auth/register` | Public | Register new user account |
| POST | `/auth/refresh` | Public | Silent token refresh with token rotation |
| POST | `/auth/logout` | Public | Revoke active refresh token |
| POST | `/auth/logout-all` | Bearer | Revoke all active user sessions |
| POST | `/auth/forgot-password` | Public | Dispatch 6-digit password reset OTP to email |
| POST | `/auth/reset-password` | Public | Reset password using verified 6-digit OTP |
| POST | `/auth/first-login-change-password` | Bearer | Mandatory permanent password set on first login |
| GET | `/auth/login-history` | Bearer | Retrieve user login audit history |
| POST | `/auth/2fa/setup` | Bearer | Initialize 2FA TOTP setup (secret & QR code) |
| POST | `/auth/2fa/enable` | Bearer | Enable 2FA TOTP by verifying initial code |
| POST | `/auth/2fa/disable` | Bearer | Disable 2FA TOTP with code or backup recovery key |

### Recruitment & ATS (`/api/v1/recruitment` & `/api/v1/interviews`)
| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| GET | `/recruitment/jobs` | All | List open job requisitions |
| POST | `/recruitment/jobs` | ADMIN, HR | Create new job requisition |
| GET | `/recruitment/candidates` | ADMIN, HR | List candidates by stage and requisition |
| POST | `/recruitment/candidates` | ADMIN, HR | Add new candidate to talent pipeline |
| PUT | `/recruitment/candidates/{id}/stage` | ADMIN, HR | Advance candidate to next pipeline stage |
| POST | `/recruitment/candidates/{id}/convert` | ADMIN, HR | **1-Click Onboard candidate to active Employee** |
| POST | `/interviews/sessions` | ADMIN, HR | Schedule technical video interview session |
| GET | `/interviews/sessions/{token}` | All | Authenticate and join WebRTC live interview room |
| POST | `/interviews/sessions/{id}/complete` | ADMIN, HR | Submit scorecard and advance candidate stage |

### Attendance & Shifts (`/api/v1/attendance` & `/api/v1/shifts`)
| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| POST | `/attendance/punch` | All | Geofenced GPS or manual punch in/out |
| POST | `/attendance/break/toggle` | All | Toggle employee break state (Take Break / Resume) |
| GET | `/attendance/today-status` | All | Fetch live shift stopwatch and punch telemetry |
| POST | `/attendance/biometric-sync` | Public / Terminal | Webhook endpoint for physical biometric turnstiles |
| POST | `/attendance/biometric/upload-csv`| ADMIN, HR | Bulk upload physical device CSV punch logs |
| GET | `/attendance/devices` | ADMIN, HR | List registered hardware biometric terminals |
| POST | `/attendance/regularize` | All | Submit attendance regularization dispute |
| GET | `/shifts` | All | List tenant shift definitions |
| POST | `/shifts/roster/assign` | ADMIN, HR, MANAGER | Bulk schedule roster assignments |
| GET | `/shifts/roster` | All | Query roster calendar by date range & department |
| POST | `/shifts/swaps` | All | Submit mutual peer shift swap request |

### Payroll (`/api/v1/payroll`)
| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| POST | `/payroll/calculate-all` | ADMIN, HR | 1-Click batch payroll execution across all staff |
| GET | `/payroll/employee/{id}` | All | Retrieve employee payslip history |
| GET | `/payroll/slip/{id}/pdf` | All | Download cryptographically signed payslip PDF |
| GET | `/payroll/bank-batch/csv` | ADMIN, HR | Download corporate bank batch payout CSV (NEFT/RTGS) |

---

## 🔑 Default Credentials <a name="credentials"></a>

> ⚠️ **Change all default passwords immediately before deploying to production!**

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@hrms.com` | `SuperAdmin@123` | Multi-tenant governance & white-labeling |
| **Admin** | `admin@hrms.com` | `Admin@123` | Full enterprise administration & security |
| **HR Manager** | `hr@hrms.com` | `Hr@123` | ATS pipeline, 1-click onboard, payroll, offboarding |
| **IT Administrator** | `itadmin@hrms.com` | `ItAdmin@123` | Hardware inventory, service desk SLA ticketing |
| **Department Manager** | `manager@hrms.com` | `Manager@123` | Team approvals, roster matrix, shift swaps |
| **Employee** | `emp@hrms.com` | `Emp@123` | Self-service, attendance, leaves, expense claims |

*Default Tenant Identifier: `default` or `eoxys`.*

---

## 🧪 Testing & Quality Assurance <a name="testing"></a>

### 1. Static Type Checking & Vite Build
```bash
cd frontend
# Strict compile-time type verification (0 errors required)
npm run type-check

# Production Vite build
npm run build
```

### 2. Master Deep Verification Suite (Automated)
Executes comprehensive end-to-end regression tests across all 21 modular domains and 4 personas:
```bash
# 67/67 passing tests covering Auth, Attendance, ATS, Payroll, and Expenses
node scripts/master-e2e-deep-test.js
```

### 3. Backend Unit & Integration Tests (Maven)
```powershell
cd backend
mvn test -Dspring.profiles.active=test
```

---

## 🔒 Security & Edge-Case Defenses <a name="security"></a>

- [x] **Cross-Midnight Shift Binding**: Night shift check-outs (22:00–06:00) bound to the shift start date, preventing broken duration calculations.
- [x] **Loss of Pay (LOP) Prorations**: Dynamic rate calculation `perDayRate = Gross / workingDays` deducting unapproved absences.
- [x] **Negative Salary Prevention**: Net pay bounded at `0.00`; unrecovered deductions carried forward to subsequent months.
- [x] **ThreadLocal Tenant Cleanup**: Mandatory `TenantContext.clear()` in servlet filters preventing Tomcat worker thread pool contamination.
- [x] **Async Thread Context Propagation**: `TenantAwareTaskDecorator` copies `tenant_id` to Spring `@Async` thread pools.
- [x] **Duplicate Punch Debounce Filter**: Biometric events within 60 seconds discarded as hardware bounce artifacts.
- [x] **Pessimistic ID Allocation**: Race-condition-safe sequential `EMP-YYYY-XXXX` generation backed by database constraints.

---

## 📄 License

Proprietary Enterprise Software — All rights reserved.

---

*Built with ❤️ — HRMS Platform v2.4 Enterprise Edition*
