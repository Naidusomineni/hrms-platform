# 🏢 HRMS Platform v2.0 — Enterprise Edition

> A production-grade Human Resource Management System built with Spring Boot 3, React 18, PostgreSQL 18 & 16, Redis, JWT with Silent Refresh Token Rotation, WebSocket notifications, Workforce Intelligence & Generative AI, and full DevOps setup.

[![Java 21](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18%20%7C%2016-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black?logo=githubactions)](https://github.com/Naidusomineni/hrms-platform/actions)

---

## 📋 Table of Contents

1. [What's New in v2.0](#whats-new)
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
13. [Testing](#testing)
14. [Security Checklist](#security)

---

## 🆕 What's New in v2.0 <a name="whats-new"></a>

| Category | New Features |
|----------|-------------|
| **Multi-Tenancy** | SaaS organization tenant isolation (`X-Tenant-ID`), Subdomain routing (`Host` header), dynamic white-label corporate themes, strict defense-in-depth |
| **Security & 2FA** | Bank-grade RFC 6238 2FA TOTP (Google Authenticator & Authy), single-use recovery codes, account lockout, 6-digit OTP reset with resend cooldown, mandatory first-login password enforcement (`mustChangePassword`), refresh token rotation |
| **Expenses & Payouts**| Corporate business expense claims (Travel, Meals, Broadband, Supplies, Fuel, Certifications), 2-stage approval workflow (Manager -> Finance), automated 1-click sync into monthly payroll payslips |
| **Shift & Roster** | Weekly team roster calendar matrix, morning/afternoon/overnight shifts, night differential allowances, 2-tier mutual peer/manager shift swap state machine |
| **Attendance 2.0** | Live shift digital stopwatch, break tracker (`Take Break` / `Resume Work`), biometric turnstile fleet integration, bulk CSV punch sync, Geo-Fenced GPS attendance with Haversine office radius validation |
| **Payroll 2.0** | 1-Click vector PDF payslip generator with embedded verification QR code and Indian rupee words, non-taxable business reimbursements, corporate bank batch NEFT/RTGS CSV export |
| **Offboarding & F&F** | Employee resignation lifecycle, 4-department clearance NOC (IT, Finance, HR, Manager), statutory Gratuity & Leave encashment calculation, Relieving & Experience Letter PDF generation |
| **Workforce AI** | Generative AI HR knowledge copilot (RAG semantic search for leave/tax/POSH policies), predictive attrition flight risk radar, candidate ATS resume match scorecard |
| **Service Desk & Comms** | IT support tickets with SLA countdown timers and diagnostic comments, company broadcast announcements with employee read-acknowledgement tracking |
| **Database** | Upgraded to PostgreSQL 18 & 16, 11 versioned Flyway migrations (V1–V11), 53 relational tables with composite indexes |
| **Cloud & DevOps** | Multi-stage Docker (Java 21 Temurin + Nginx Alpine), Docker Compose with Postgres 16 & Redis 7.2, hardened GitHub Actions CI/CD pipeline |

---

## 🛠️ Tech Stack <a name="tech-stack"></a>

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.2.3 | Application framework & REST controllers |
| Java | 21 (LTS) | Runtime with virtual thread readiness |
| Spring Security 6 | 3.2.3 | Auth, stateless JWT filter chain, RBAC |
| Spring Data JPA | 3.2.3 | Tenant-isolated repositories & pagination |
| Spring WebSocket | 3.2.3 | Real-time notifications (STOMP over SockJS) |
| PostgreSQL | 18 / 16 | Primary relational database |
| Flyway | 10.5.0 | Database migrations (V1–V10) |
| Redis | 7.2 | Distributed token blacklisting & session store |
| JJWT | 0.11.5 | JWT token generation & rotation |
| Bucket4j | 8.10.1 | Rate limiting & brute-force defense |
| Thymeleaf | 3.x | Branded MNC HTML email templates |
| Lombok | 1.18.30 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.3.0 | Interactive Swagger UI documentation |
| Micrometer Prometheus | Latest | Application health & performance metrics |
| Maven | 3.9.6 | Build tool |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI component library |
| TypeScript | 5.8 | Compile-time type safety, domain models & typed API contracts |
| Vite | 5.4.21 | Build tool & fast Hot Module Replacement with TS/JSX hybrid support |
| Redux Toolkit | 2.2.3 | Global state management with typed hooks (`useAppSelector`, `useAppDispatch`) |
| React Router | 6.22 | Client-side SPA routing & route guards |
| Axios | 1.6.8 | HTTP client with automatic JWT refresh interceptor |
| Tailwind CSS | 3.4.3 | Tier-1 corporate styling system |
| Lucide React | 0.344 | Vector SVG iconography |
| jsPDF / autoTable | 2.5 | Vector PDF generator (Payslips, Relieving Letters) |
| Recharts | 2.12 | Executive charts & data visualizations |
| @stomp/stompjs | 7.0 | WebSocket real-time push client |
| date-fns | 3.6 | Corporate date calculations |

---

## ✨ Features <a name="features"></a>

### 🏢 SaaS Multi-Tenancy
- [x] Header-based tenant resolution (`X-Tenant-ID`) with subdomain and query param fallbacks
- [x] Subdomain Host header resolution (e.g. `acme.hrms.com` or `acme.localhost`)
- [x] Dynamic corporate white-labeling: custom logos, brand colors (`#HEX`), and company display names
- [x] Defense-in-depth isolation: `BaseTenantEntity` enforces tenant context on all entities
- [x] Zero unbounded `findAll()` standard across all database queries
- [x] Tenant-specific branding, department structures, policy rules, and audit logs
- [x] Clean `TenantContext.clear()` execution in filter `finally` blocks

### 🔐 Authentication & Security
- [x] JWT Access Token (15 min) + Refresh Token Rotation (7 days)
- [x] BCrypt password hashing (cost factor 12)
- [x] Account lockout after 5 consecutive failed attempts (30 min lock)
- [x] Mandatory first-login password change enforcement (`mustChangePassword`)
- [x] Auto-generation of temporary onboarding credentials
- [x] Forgot password with 6-digit OTP (BCrypt-hashed in DB, 15-min expiry)
- [x] 60-second resend OTP cooldown timer with email delivery
- [x] Rate limiting via Bucket4j on public authentication endpoints
- [x] Login history tracking (IP address, browser, OS, device, status)
- [x] 5-tier role-based access control: SUPER_ADMIN, ADMIN, HR, MANAGER, EMPLOYEE
- [x] Silent token refresh through Axios response interceptor
- [x] Session invalidation and distributed token blacklisting via Redis
- [x] Bank-grade RFC 6238 Two-Factor Authentication (2FA / TOTP) via Google Authenticator, Microsoft Authenticator, and Authy
- [x] Single-use encrypted backup recovery codes (8 emergency keys)
- [x] Two-step login challenge flow with temporary MFA verification tokens

### 👥 Employee Management
- [x] Full CRUD operations with soft delete and multi-tenant scoping
- [x] Employee number auto-generation (`EMP-YYYY-NNNN`)
- [x] Server-side multi-field search, department filtering, pagination, and sorting
- [x] Profile picture upload and encrypted document vault
- [x] Emergency contact records and banking details (PAN, PF, IFSC, Bank Account)
- [x] Symmetrical 1:1 module architecture with dedicated employee details portal

### 🏢 Department Management
- [x] Department creation with budget allocation tracking
- [x] Department head / manager assignment
- [x] Location tracking and live staff headcounts
- [x] Departmental attrition and risk distribution analytics

### 📅 Attendance & Biometric Hub
- [x] Live digital shift stopwatch (`04h 12m 30s`) with 8h visual progress bar
- [x] Break tracking controls: `Take Break` / `Resume Work` with break duration logging
- [x] Work mode context switch: `Office` vs `Remote / WFH`
- [x] Biometric turnstile fleet integration: REST webhook listener and device registry
- [x] Bulk biometric CSV punch file upload and reconciliation engine
- [x] Attendance regularization request and approval workflow
- [x] Precision Geo-Fenced Mobile & Web GPS punch: Haversine distance validation against office coordinates
- [x] Office location registry with configurable geo-fence radius (e.g. 200m) and IP whitelisting
- [x] Status tracking: Present, Absent, Half Day, WFH, On Leave, Late Mark

### 🔄 Shift & Roster Management
- [x] Enterprise shift definitions: Morning, Afternoon, General, Overnight Night shifts
- [x] Grace period thresholds (15 mins) and automated night differential allowance rates
- [x] Weekly team roster calendar matrix with date-range filters
- [x] Bulk schedule allocation across employees
- [x] 2-tier shift swap state machine: mutual peer consent (`PEER_ACCEPTED`) followed by manager approval
- [x] Atomic schedule mutation: live database swap of roster shift foreign keys upon approval

### 🏖️ Leave Management
- [x] 9 statutory leave types: Annual, Sick, Casual, Maternity, Paternity, Unpaid, Comp-Off, Emergency, Bereavement
- [x] Leave accrual calculation: 1.75 privilege leaves/month (21 days/year)
- [x] Apply, approve, reject, and cancellation workflows with notification triggers
- [x] Automatic balance deduction, calendar overlap prevention, and weekend exclusion

### 🧾 Expense Claims & Business Reimbursements
- [x] Corporate employee claim submission across 7 categories (Travel, Meals, Broadband, Supplies, Fuel, Certifications)
- [x] Receipt attachment upload and audit tracking
- [x] 2-Stage approval state machine: Reporting Manager Review → Finance Department Audit
- [x] Automated 1-Click sync with Payroll 2.0: approved claims automatically disburse with monthly payslips
- [x] Real-time claim status tracking: `SUBMITTED`, `MANAGER_APPROVED`, `FINANCE_APPROVED`, `DISBURSED`, `REJECTED`

### 💰 Payroll & Compensation
- [x] 1-Click batch payroll execution across all active employees
- [x] Salary breakdown: Basic (50%), HRA (20%), Special Allowance, Night Allowance
- [x] Non-taxable business expense reimbursement integration
- [x] Statutory deductions: PF (12%), Professional Tax, TDS
- [x] 1-Click vector PDF payslip generator with embedded verification QR code, digital seal, and Indian rupee words
- [x] Corporate bank batch disbursement CSV export (NEFT / RTGS / IMPS)
- [x] Indian statutory tax declaration support (New vs Old Tax Regime)

### 🚪 Full & Final Settlement (F&F) & Offboarding
- [x] Resignation submission and separation review workflow
- [x] 4-department clearance NOC: IT Assets, Finance Dues, HR Admin, Reporting Manager
- [x] Statutory Gratuity calculation engine: `(15 * Basic * Tenure) / 26` (tenure >= 5 yrs)
- [x] Leave encashment formula: `(Accumulated Leaves * Basic) / 30`
- [x] Asset recovery deduction and net payable disbursement statement
- [x] Vector PDF generation for official Relieving Letters, Experience Certificates, and F&F Statements
- [x] Automatic transition of employee status to `TERMINATED` upon disbursement

### 🧠 Workforce Intelligence & Generative AI Copilot
- [x] Natural language AI HR Assistant with semantic RAG intent matching
- [x] Pre-seeded corporate knowledge base: Leave rollovers, Group Mediclaim, Tax slabs, POSH guidelines, Shift rules
- [x] Instant answer generation with confidence scores, policy citations, and action links (`/leaves`, `/shifts`, `/payroll`, `/helpdesk`)
- [x] Related inquiry suggestion pills and intelligent out-of-domain helpdesk fallback
- [x] Predictive workforce attrition flight risk radar evaluating attendance volatility, compensation stagnation, tenure cliff, and performance reviews
- [x] Departmental risk distribution heatmap and actionable executive retention interventions
- [x] Smart ATS candidate match scorecard: calculates match percentage, skills overlap, missing competencies, and hiring recommendations (`STRONG_HIRE`, `HIRE`, `CONSIDER`, `REJECT`)

### 🎯 Performance & OKR
- [x] Company objectives and departmental Key Results (OKR) tracking
- [x] Appraisal review cycles with self-evaluation ratings and manager feedback
- [x] Historical performance records and flight risk correlation

### 💼 Recruitment & Smart ATS
- [x] Job opening requisition and job posting management
- [x] Candidate applicant tracking pipeline: Applied → Screening → Technical → HR Round → Offer → Hired
- [x] Candidate conversion into active employee record with auto-provisioned user account

### 💻 IT Assets & Hardware Management
- [x] IT asset inventory catalog (Laptops, monitors, mobile devices, licenses)
- [x] Asset allocation to employees with condition tracking and return records
- [x] Direct link with offboarding NOC clearance for asset recovery

### 🎫 IT Service Desk & Ticketing
- [x] Internal support ticketing for hardware, software, VPN, and HR grievances
- [x] Priority levels (CRITICAL, HIGH, MEDIUM, LOW) with SLA countdown deadlines
- [x] Diagnostic engineer comment threads and ticket resolution notes
- [x] Confidential ticket submission directly to the Internal Committee (POSH)

### 📢 Company Announcements & Communication
- [x] Broadcast notices with priority flags (URGENT, IMPORTANT, GENERAL)
- [x] Department-targeted or global company distribution
- [x] Mandatory employee read-acknowledgement tracking

### 📊 Executive Dashboard & Analytics
- [x] KPI metrics: Total employees, Active departments, Present today, Pending leave & ticket queues
- [x] Attendance breakdown charts and department headcount visualizations
- [x] Role-based dashboard views customized for Admins, Managers, and Employees

### 🔔 Notifications & Real-Time Push
- [x] Real-time WebSocket notifications via STOMP over SockJS
- [x] In-app notification center with unread count and dismiss controls
- [x] Branded MNC Thymeleaf HTML email notifications (Welcome, OTP, Salary Slip, Ticket Updates)

### 🚀 DevOps & Cloud Architecture
- [x] Production Docker Compose (PostgreSQL 16, Redis 7.2, Backend Java 21, Frontend Nginx Alpine, Prometheus, Grafana)
- [x] Multi-stage backend container with Eclipse Temurin JDK 21 builder and JRE 21 Alpine runtime
- [x] Multi-stage frontend container with Node 20 builder and production Nginx Alpine with SPA fallback & Gzip
- [x] Automated GitHub Actions CI/CD pipeline (Java 21 Maven tests against PostgreSQL 16, Vite build, Docker packaging)
- [x] Container-aware JVM memory tuning (`-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC`)
- [x] Prometheus `/api/actuator/prometheus` metrics endpoint and Grafana dashboards

---

## 🏛️ Architecture <a name="architecture"></a>

```
Client (React 18 SPA + Vite + TailwindCSS)
      │
      ▼
Nginx Reverse Proxy (port 80 / 443)
      │
      ├── /api/** ──── Spring Boot 3.2.3 (port 8080)
      │                      │
      │               ┌──────┴──────────────────────────┐
      │               │   Filter Chain                  │
      │               │   ├─ TenantContextFilter        │
      │               │   ├─ RateLimitFilter (Bucket4j) │
      │               │   └─ JwtAuthFilter              │
      │               │                                 │
      │               │   @RestControllers (/v1/)       │
      │               │   ├─ /v1/auth                   │
      │               │   ├─ /v1/employees              │
      │               │   ├─ /v1/attendance             │
      │               │   ├─ /v1/shifts                 │
      │               │   ├─ /v1/leaves                 │
      │               │   ├─ /v1/payroll                │
      │               │   ├─ /v1/offboarding            │
      │               │   ├─ /v1/intelligence           │
      │               │   ├─ /v1/helpdesk               │
      │               │   └─ /v1/announcements          │
      │               │                                 │
      │               │   Business Services & RAG       │
      │               │   └─ Tenant-Scoped @Transactional│
      │               │                                 │
      │               │   Repositories & Persistence    │
      │               │   └─ Spring Data JPA (No findAll)│
      │               └─────────────────────────────────┘
      │                        │
      │              ┌─────────┼──────────┐
      │              ▼         ▼          ▼
      │        PostgreSQL 18  Redis 7.2  Flyway Engine
      │          (hrms_db)   (Blacklist)   (V1 - V10)
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

# 2. Configure environment (optional - defaults pre-configured)
cp .env.example .env

# 3. Start the complete stack
docker compose up -d --build

# 4. Access applications
open http://localhost           # Frontend Application
open http://localhost:8080/api/swagger-ui/index.html  # API Documentation
open http://localhost:3000      # Grafana Monitoring
```

---

## 🔧 Manual Setup <a name="manual-setup"></a>

### Prerequisites
| Tool | Version |
|------|---------|
| JDK | 21 (LTS) |
| Maven | 3.9+ |
| Node.js | 20+ |
| PostgreSQL | 18 or 16 |
| Redis | 7+ (optional for local dev) |

### 1. PostgreSQL Setup
Using `psql` or pgAdmin, create the database:
```sql
CREATE DATABASE hrms_db;
```
*(Default development credentials: port `5433` or `5432`, user `postgres`, password `Naidu@98666` or configured in `application.properties`).*

### 2. Configure Backend
Ensure your database credentials match in `backend/src/main/resources/application.properties`:
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
*Verify backend health: `http://localhost:8080/api/actuator/health`*  
*Swagger Documentation: `http://localhost:8080/api/swagger-ui/index.html`*

### 4. Start Frontend
```powershell
cd frontend
npm install
npm run dev -- --host
```
*Frontend application: `http://localhost:5173`*

---

## 🐳 Docker Deployment <a name="docker"></a>

```bash
# Build and launch in detached mode
docker compose up -d --build

# Monitor container logs
docker compose logs -f backend
docker compose logs -f frontend

# Scale backend instances
docker compose up -d --scale backend=2

# Stop stack
docker compose down

# Stop and wipe persistent database volumes (Caution)
docker compose down -v
```

### Service URLs (Docker)
| Service | URL |
|---------|-----|
| Frontend Portal | `http://localhost` |
| Backend API | `http://localhost:8080/api` |
| Swagger UI | `http://localhost:8080/api/swagger-ui/index.html` |
| Prometheus Metrics | `http://localhost:9090` |
| Grafana Dashboards | `http://localhost:3000` |
| PostgreSQL Database | `localhost:5433` (internal `5432`) |
| Redis Cache | `localhost:6379` |

---

## 📡 API Reference <a name="api"></a>

All API endpoints are prefixed with `/api/v1/` and resolve organization multi-tenancy via `X-Tenant-ID` header.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Authenticate user, return access + refresh tokens |
| POST | `/auth/register` | Public | Register new user account |
| POST | `/auth/refresh` | Public | Silent token refresh with token rotation |
| POST | `/auth/logout` | Public | Revoke active refresh token |
| POST | `/auth/logout-all` | Bearer | Revoke all active user sessions |
| POST | `/auth/forgot-password` | Public | Dispatch 6-digit password reset OTP to email |
| POST | `/auth/reset-password` | Public | Reset password using verified 6-digit OTP |
| POST | `/auth/first-login-change-password` | Bearer | Mandatory permanent password set on first login |
| GET | `/auth/login-history` | Bearer | Retrieve user login audit history |
| POST | `/auth/2fa/setup` | Bearer | Initialize 2FA TOTP setup (returns secret & otpauth QR URI) |
| POST | `/auth/2fa/enable` | Bearer | Enable 2FA TOTP by verifying initial 6-digit code |
| POST | `/auth/2fa/disable` | Bearer | Disable 2FA TOTP by supplying current 6-digit code or backup code |

### Employees (`/api/v1/employees`)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/employees` | All | Paginated & searchable employee list |
| GET | `/employees/{id}` | All | Detailed employee profile |
| POST | `/employees` | ADMIN, HR | Create employee with auto-generated credentials |
| PUT | `/employees/{id}` | ADMIN, HR | Update employee information |
| DELETE | `/employees/{id}` | ADMIN | Soft delete employee record |

### Attendance & Shifts (`/api/v1/attendance` & `/api/v1/shifts`)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/attendance/auto-login-punch` | All | Automated check-in punch on login |
| POST | `/attendance/break-toggle` | All | Toggle break state (Take Break / Resume) |
| GET | `/attendance/today-status` | All | Fetch live shift stopwatch and punch state |
| POST | `/attendance/biometric-sync` | Public / Webhook | Webhook endpoint for biometric turnstile punch |
| POST | `/attendance/biometric-upload` | ADMIN, HR | Bulk upload biometric device CSV records |
| GET | `/shifts` | All | List tenant shift definitions |
| POST | `/shifts/roster/assign` | ADMIN, HR, MANAGER | Bulk schedule roster assignments |
| GET | `/shifts/roster` | All | Query roster calendar by date range & department |
| POST | `/shifts/swaps` | All | Submit mutual peer shift swap request |
| PUT | `/shifts/swaps/{id}/peer-respond` | All | Peer employee accepts or declines swap |
| PUT | `/shifts/swaps/{id}/manager-review` | ADMIN, HR, MANAGER | Manager approves swap & mutates roster schedules |

### Payroll (`/api/v1/payroll`)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/payroll/process-all` | ADMIN, HR | 1-Click batch payroll execution across all staff |
| GET | `/payroll/employee/{id}` | All | Retrieve employee payslip history |
| GET | `/payroll/bank-batch` | ADMIN, HR | Query NEFT/RTGS bank disbursement batch |
| GET | `/payroll/bank-batch-export` | ADMIN, HR | Download corporate bank batch payout CSV |

### Expense Claims & Reimbursements (`/api/v1/expenses`)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/expenses/claims?employeeId=` | All | Submit new business expense claim with receipt |
| GET | `/expenses/claims/my?employeeId=` | All | Retrieve current employee's submitted expense claims |
| GET | `/expenses/claims?status=` | ADMIN, HR, MANAGER | List all claims with optional status filtering |
| GET | `/expenses/claims/{id}` | All | Get single expense claim details |
| PUT | `/expenses/claims/{id}/manager-review` | ADMIN, HR, MANAGER | Manager review and sign-off (APPROVE / REJECT) |
| PUT | `/expenses/claims/{id}/finance-review` | ADMIN, HR | Finance audit review and sign-off (APPROVE / REJECT) |

### Offboarding & F&F (`/api/v1/offboarding`)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/offboarding/separations` | All | Submit employee resignation / separation |
| GET | `/offboarding/separations` | ADMIN, HR, MANAGER | Separations register with clearance status |
| PUT | `/offboarding/clearances/{id}` | ADMIN, HR, MANAGER | Sign off departmental NOC checkpoint |
| POST | `/offboarding/settlements/calculate` | ADMIN, HR | Compute statutory Gratuity & Leave encashment |
| POST | `/offboarding/settlements/disburse` | ADMIN, HR | Disburse final settlement & terminate staff |

### Workforce Intelligence & AI (`/api/v1/intelligence`)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/intelligence/assistant/ask` | All | Ask AI Copilot corporate HR policy question |
| GET | `/intelligence/policies` | All | Browse active corporate knowledge base policies |
| GET | `/intelligence/attrition/risk-analysis` | ADMIN, HR, MANAGER | Predictive workforce attrition flight risk radar |
| POST | `/intelligence/attrition/re-evaluate` | ADMIN, HR | Re-run real-time predictive flight risk engine |
| GET | `/intelligence/attrition/department-overview` | ADMIN, HR, MANAGER | Departmental risk distribution aggregation |
| POST | `/intelligence/ats/evaluate-candidate` | ADMIN, HR, MANAGER | AI candidate resume match scorecard |

### IT Service Desk & Helpdesk (`/api/v1/helpdesk` & `/api/v1/communication`)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/helpdesk/tickets` | All | Create support ticket with SLA priority |
| GET | `/helpdesk/tickets` | All | List tickets with SLA deadline countdowns |
| POST | `/helpdesk/tickets/{id}/comments` | All | Add engineer diagnosis comment |
| PUT | `/helpdesk/tickets/{id}/status` | ADMIN, HR, MANAGER | Advance ticket state & resolve |
| POST | `/communication/announcements` | ADMIN, HR | Publish broadcast announcement |
| POST | `/communication/announcements/{id}/acknowledge` | All | Acknowledge company notice |

---

## 🔑 Default Credentials <a name="credentials"></a>

> ⚠️ **Change all passwords immediately before production deployment!**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `superadmin@hrms.com` | `SuperAdmin@123` | Multi-tenant governance & billing |
| **Admin** | `admin@hrms.com` | `Admin@123` | Full enterprise administration |
| **HR Manager** | `hr@hrms.com` | `Hr@123` | Employees, payroll, recruitment, offboarding |
| **IT Administrator** | `itadmin@hrms.com` | `ItAdmin@123` | IT hardware inventory, serial tracking, service desk ticketing SLA |
| **Department Manager** | `manager@hrms.com` | `Manager@123` | Approvals, roster matrix, shift swaps, expense review |
| **Employee** | `emp@hrms.com` | `Emp@123` | Self-service, attendance, shift swaps, leave, expense submission |

*Default Tenant Identifier: `default` (select on login portal or pass via `X-Tenant-ID: default`).*

---

## 🌍 Environment Variables <a name="env"></a>

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | Yes | `5433` | PostgreSQL port (`5433` local, `5432` container) |
| `DB_NAME` | Yes | `hrms_db` | PostgreSQL database name |
| `DB_USERNAME` | Yes | `postgres` | Database username |
| `DB_PASSWORD` | Yes | `Naidu@98666` | Database password |
| `FLYWAY_ENABLED` | No | `false` | Enable automated Flyway migrations on boot |
| `JWT_SECRET` | Yes | `404E63...` | 256-bit base64 JWT secret |
| `JWT_ACCESS_EXPIRY` | No | `900000` | Access token TTL in milliseconds (15 min) |
| `JWT_REFRESH_EXPIRY` | No | `604800000` | Refresh token TTL in milliseconds (7 days) |
| `MAIL_HOST` | No | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | No | `587` | SMTP port |
| `MAIL_USERNAME` | No | `—` | SMTP username (leave empty for console fallback) |
| `MAIL_PASSWORD` | No | `—` | SMTP app password |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_PASSWORD` | No | `redispass` | Redis authentication password |
| `FRONTEND_URL` | No | `http://localhost:5173` | Client URL for email redirects |

---

## 🔄 CI/CD Pipeline <a name="cicd"></a>

GitHub Actions workflow triggers on push or pull request to `main` or `develop`:

```
Push to main
    │
    ├── backend-ci
    │     ├── Set up JDK 21 (Temurin)
    │     ├── Spin up PostgreSQL 16 Service Container
    │     ├── Cache Maven Dependencies (~/.m2/repository)
    │     ├── Run Tests (mvn test -B -e -Dspring.profiles.active=test)
    │     ├── Build JAR Package (mvn package -DskipTests)
    │     └── Docker: Build & tag backend image
    │
    └── frontend-ci
          ├── Set up Node.js 20
          ├── Cache npm modules
          ├── Install dependencies (npm ci --legacy-peer-deps)
          ├── Build Production Vite Bundle (npm run build)
          └── Docker: Build & tag frontend Nginx image
```

---

## 📁 Project Structure <a name="structure"></a>

```
hrms-platform/
├── .github/workflows/ci-cd.yml      # Hardened GitHub Actions CI/CD Pipeline
├── .gemini/skills/                  # Workspace Engineering Standards
├── SKILLS.md                        # Senior Developer & Architecture Standard
├── docker-compose.yml               # Production Stack (Postgres 16, Redis, Backend, Frontend)
├── setup-postgres.bat               # Automated PostgreSQL local configuration script
│
├── backend/                         # Spring Boot 3.2.3 (Java 21 LTS)
│   ├── Dockerfile                   # Multi-stage Temurin JDK 21 & Alpine JRE
│   ├── pom.xml                      # Maven build configuration & dependencies
│   └── src/
│       ├── main/java/com/hrms/
│       │   ├── config/              # SecurityConfig, DataInitializer, SwaggerConfig
│       │   ├── entity/              # BaseTenantEntity, Employee, User, Attendance, etc.
│       │   ├── domain/storage/      # StorageService port & abstractions
│       │   ├── infrastructure/      # Multi-tenancy context/filters & LocalStorageService
│       │   └── modules/             # 21 Package-by-feature business modules
│       │       ├── attendance/      # Biometric turnstiles, break timer, daily punches
│       │       ├── auth/            # JWT authentication, 6-digit OTP, first-login
│       │       ├── communication/   # Company announcements & acknowledgment tracking
│       │       ├── helpdesk/        # IT Service Desk, SLA tracking, ticket comments
│       │       ├── intelligence/    # Generative AI HR Copilot, Attrition Radar, ATS Matcher
│       │       ├── offboarding/     # Resignation, 4-dept NOC clearance, statutory F&F
│       │       ├── payroll/         # Payslips, statutory deductions, bank batch exports
│       │       ├── recruitment/     # Job postings, candidate pipeline, scorecards
│       │       └── shift/           # Rotational shifts, roster matrix, shift swaps
│       ├── main/resources/
│       │   ├── application.properties # Main configuration (PostgreSQL, Hikari, Mail, JWT)
│       │   ├── db/migration/        # Flyway versioned migrations (V1 through V10)
│       │   └── templates/email/     # Branded Thymeleaf HTML email templates
│       └── test/                    # Unit & Mockito test suites (AuthServiceTest, etc.)
│
├── frontend/                        # React 18 + Vite + TailwindCSS
│   ├── Dockerfile                   # Multi-stage Node 20 & Nginx Alpine container
│   ├── nginx.conf                   # Production Nginx reverse proxy & security headers
│   ├── package.json & vite.config.js
│   └── src/
│       ├── api/                     # Unified API clients (shiftAPI, intelligenceAPI, etc.)
│       ├── components/              # Layout, Sidebar, Navbar, Modal, common controls
│       ├── modules/                 # 21 Symmetrical feature modules
│       │   ├── intelligence/        # Workforce Intelligence & AI Copilot Page
│       │   ├── shift/               # Shift & Roster Calendar Matrix Page
│       │   ├── offboarding/         # Offboarding, Clearance NOC & F&F Portal
│       │   └── auth/                # Corporate Login, OTP Reset, First-Login Change
│       └── utils/                   # Payslip & Relieving Letter Vector PDF Generators
│
├── infra/                           # Prometheus & Grafana monitoring configuration
│
└── test_*.ps1                       # 6 Complete Automated QA Regression Test Suites
```

---

## 🧪 Testing <a name="testing"></a>

### Frontend Static & Type Verification
```bash
cd frontend
# 1. Type-check TypeScript layer (0 errors target)
npm run type-check

# 2. Production Vite bundle build
npm run build

# 3. Playwright browser E2E test
npm run test:e2e
```

### Full-Stack End-to-End API Integration Suite (Automated)
Execute against the running backend to verify all 21 core domain endpoints across 4 distinct personas (Admin, Manager, Employee, IT Admin):
```bash
node scripts/e2e-suite.js
```

### Backend Unit Tests (Maven)
```powershell
cd backend
mvn test -Dspring.profiles.active=test

# Run specific unit test class
mvn test -Dtest=AuthServiceTest
```

### Automated Integration Test Suites (PowerShell)
Execute against the running backend to verify all enterprise modules:

```powershell
# 1. MNC Email Delivery & Credential Lifecycle
powershell -ExecutionPolicy Bypass -File .\test_phase4_milestone1_email_and_auth.ps1

# 2. Attendance 2.0 & Enterprise Payroll 2.0
powershell -ExecutionPolicy Bypass -File .\test_phase4_milestone2_attendance_payroll.ps1

# 3. Full & Final Settlement (F&F) & Offboarding Lifecycle
powershell -ExecutionPolicy Bypass -File .\test_phase4_milestone3_offboarding_settlement.ps1

# 4. IT Service Desk & Company Communication
powershell -ExecutionPolicy Bypass -File .\test_it_service_desk_and_communication.ps1

# 5. Shift & Roster Management
powershell -ExecutionPolicy Bypass -File .\test_phase4_milestone4_shift_roster.ps1

# 6. Generative HR Assistant & Workforce Intelligence
powershell -ExecutionPolicy Bypass -File .\test_phase4_milestone5_workforce_intelligence.ps1

# 7. Enterprise Operations, Expense Claims, Geo-Fencing, White-Labeling & 2FA TOTP
powershell -ExecutionPolicy Bypass -File .\test_phase6_enterprise_operations.ps1
```

---

## 🔒 Security Checklist <a name="security"></a>

- [x] Multi-tenant isolation verified with `BaseTenantEntity` on all domain models
- [x] Banned unbounded `findAll()` database queries across all repositories
- [x] Passwords hashed with BCrypt (cost factor 12)
- [x] Account lockout mechanism enforced after 5 failed login attempts
- [x] Mandatory first-login permanent password reset enforcement
- [x] Stateless JWT with short-lived access tokens (15m) and refresh token rotation (7d)
- [x] Distributed token blacklisting enabled via Redis with memory map fallback
- [x] Rate limiting active via Bucket4j on public authentication routes
- [x] Nginx security headers configured: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- [x] CORS origin restriction configured in `SecurityConfig.java`

---

## 📄 License

Proprietary Enterprise Software — All rights reserved.

---

*Built with ❤️ — HRMS Platform v2.0 Enterprise Edition*
