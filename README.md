# 🏢 HRMS Platform v2.0 — Enterprise Edition

> A production-grade Human Resource Management System built with Spring Boot 3, React 18, MySQL 8, Redis, JWT with Refresh Token Rotation, WebSocket notifications, and full DevOps setup.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black)](https://github.com/features/actions)

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

---

## 🆕 What's New in v2.0 <a name="whats-new"></a>

| Category | New Features |
|----------|-------------|
| **Security** | Account lockout, Forgot/Reset password OTP flow, Email verification, 2FA TOTP ready, Refresh token rotation, Rate limiting (Bucket4j), Login history tracking |
| **Modules** | Payroll processing with salary breakdown, Performance reviews, Job postings & recruitment, Candidate pipeline tracking |
| **Notifications** | WebSocket real-time push, Email templates (Thymeleaf), 13 notification event types |
| **DevOps** | GitHub Actions CI/CD, Prometheus + Grafana monitoring, structured JSON logging, K8s readiness, Redis caching layer |
| **API** | Versioned endpoints (/v1/), Request ID tracing, Rate limiting on auth endpoints |
| **Frontend** | Skeleton loaders, Dark mode, Framer Motion animations, Error boundaries, Advanced pagination |
| **DB** | 15 tables with proper indexes, Soft delete, JPA auditing, Full-text search ready |

---

## 🛠️ Tech Stack <a name="tech-stack"></a>

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.2.3 | Application framework |
| Spring Security 6 | 3.2.3 | Auth, JWT filter chain, RBAC |
| Spring Data JPA | 3.2.3 | ORM, repositories |
| Spring WebSocket | 3.2.3 | Real-time notifications |
| MySQL | 8.0 | Primary relational database |
| JJWT | 0.11.5 | JWT generation & validation |
| Bucket4j | 8.7.0 | Rate limiting |
| Thymeleaf | 3.x | Email HTML templates |
| Lombok | 1.18.30 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.3.0 | Swagger UI |
| Micrometer Prometheus | Latest | Application metrics |
| Maven | 3.9.6 | Build tool |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI library |
| Vite | 5.2 | Build tool, HMR |
| Redux Toolkit | 2.2.3 | Global state management |
| React Router | 6.22 | Client-side routing |
| Axios | 1.6.8 | HTTP client + interceptors |
| React Hook Form | 7.51 | Form handling |
| Yup | 1.4.0 | Schema validation |
| Recharts | 2.12 | Dashboard charts |
| Tailwind CSS | 3.4.3 | Utility-first styling |
| @stomp/stompjs | 7.0 | WebSocket client |
| Framer Motion | 11.1 | Animations |
| date-fns | 3.6 | Date utilities |

---

## ✨ Features <a name="features"></a>

### 🔐 Authentication & Security
- [x] JWT Access Token (15 min) + Refresh Token Rotation (7 days)
- [x] BCrypt password hashing (cost factor 12)
- [x] Account lockout after 5 failed attempts (30 min lock)
- [x] Forgot password with 6-digit OTP (BCrypt-hashed in DB)
- [x] Email verification on registration
- [x] Rate limiting: 10 login attempts/minute/IP
- [x] Login history with IP, browser, OS tracking
- [x] Role-based access control: SUPER_ADMIN, ADMIN, HR, MANAGER, EMPLOYEE
- [x] Silent token refresh (Axios interceptor)
- [x] Session invalidation after password change

### 👥 Employee Management
- [x] Full CRUD with soft delete
- [x] Employee number auto-generation (EMP-YYYY-NNNN)
- [x] Server-side search, filter, pagination, sorting
- [x] Multi-shift support (Morning, Afternoon, Night, Flexible)
- [x] Leave balance tracking (Annual, Sick, Casual)
- [x] Profile picture & resume upload (ready)
- [x] Emergency contact management
- [x] Bank & tax details (PAN, PF, IFSC)

### 🏢 Department Management
- [x] Department creation with budget tracking
- [x] Manager assignment
- [x] Location tracking
- [x] Employee count per department
- [x] Soft delete

### 📅 Attendance Management
- [x] Mark attendance with check-in/check-out times
- [x] Auto working hours calculation
- [x] Monthly calendar view
- [x] Status tracking: Present, Absent, Half Day, WFH, On Leave, Holiday, Late
- [x] Duplicate prevention (unique constraint: employee + date)
- [x] Today's attendance list for HR

### 🏖️ Leave Management
- [x] 9 leave types: Annual, Sick, Casual, Maternity, Paternity, Unpaid, Compensatory, Emergency, Bereavement
- [x] Apply, approve, reject, cancel workflow
- [x] Leave balance auto-deduction on approval
- [x] Overlap detection
- [x] Working days calculation (excludes weekends)
- [x] Email notification on approval/rejection

### 💰 Payroll Module
- [x] Monthly payroll processing
- [x] Salary components: Basic (50%), HRA (20%), Special Allowance
- [x] Statutory deductions: PF (12%), Professional Tax, TDS
- [x] Pro-rata calculation based on attendance
- [x] Email notification with net salary
- [x] Payslip history view

### 📊 Dashboard & Analytics
- [x] KPI cards: Total employees, Departments, Present today, Pending leaves
- [x] Bar chart: Employees by department
- [x] Pie chart: Today's attendance breakdown
- [x] Recent hires table
- [x] Upcoming birthdays (next 7 days)
- [x] Role-based dashboard content

### 🔔 Notifications
- [x] Real-time WebSocket notifications (STOMP over SockJS)
- [x] In-app notification center with unread count
- [x] Email notifications for 8+ events
- [x] Mark as read / mark all read

### 🚀 DevOps
- [x] Docker + Docker Compose (MySQL, Redis, Backend, Frontend, Prometheus, Grafana)
- [x] GitHub Actions CI/CD (test, build, push, deploy)
- [x] Nginx reverse proxy with WebSocket support
- [x] Prometheus metrics endpoint
- [x] Grafana dashboards
- [x] Structured JSON logging (Logstash encoder)
- [x] Request ID tracing (MDC)
- [x] Health check endpoints (liveness, readiness)
- [x] Graceful shutdown

---

## 🏛️ Architecture <a name="architecture"></a>

```
Client (React SPA)
      │
      ▼
Nginx (port 80)
      │
      ├── /api/** ──── Spring Boot (port 8080)
      │                      │
      │               ┌──────┴──────────────┐
      │               │   Filter Chain        │
      │               │   ├─ RequestIdFilter  │
      │               │   ├─ RateLimitFilter  │
      │               │   └─ JwtAuthFilter    │
      │               │                       │
      │               │   @RestControllers    │
      │               │   └─ /v1/auth         │
      │               │   └─ /v1/employees    │
      │               │   └─ /v1/departments  │
      │               │   └─ /v1/attendance   │
      │               │   └─ /v1/leaves       │
      │               │   └─ /v1/payroll      │
      │               │   └─ /v1/dashboard    │
      │               │   └─ /v1/admin        │
      │               │                       │
      │               │   Services            │
      │               │   └─ Business Logic   │
      │               │   └─ @Transactional   │
      │               │                       │
      │               │   Repositories        │
      │               │   └─ Spring Data JPA  │
      │               └──────────────────────┘
      │                        │
      │              ┌─────────┼──────────┐
      │              ▼         ▼          ▼
      │           MySQL 8    Redis    MinIO/S3
      │
      └── /ws ────── WebSocket (STOMP)
                          │
                     Real-time push
                     to connected clients
```

---

## ⚡ Quick Start (Docker) <a name="quick-start"></a>

```bash
# 1. Clone
git clone https://github.com/yourorg/hrms-platform.git
cd hrms-platform

# 2. Configure environment
cp .env.example .env
# Edit .env — set DB passwords, JWT secret, mail credentials

# 3. Start everything
docker compose up --build

# 4. Access
open http://localhost           # Frontend
open http://localhost:8080/api/swagger-ui.html  # API docs
open http://localhost:3000      # Grafana monitoring
```

**First run takes 3-5 minutes** (downloading images + Maven build).

---

## 🔧 Manual Setup <a name="manual-setup"></a>

### Prerequisites
| Tool | Version |
|------|---------|
| JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| Redis | 7+ (optional for dev) |

### 1. MySQL Setup
```sql
mysql -u root -p

CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hrmsuser'@'localhost' IDENTIFIED BY 'HrmsPass@2024';
GRANT ALL PRIVILEGES ON hrms_db.* TO 'hrmsuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;

-- Load schema and seed data
mysql -u hrmsuser -p hrms_db < docs/schema.sql
```

### 2. Configure Backend
```bash
# Set environment variables (or edit application.properties)
export DB_USERNAME=hrmsuser
export DB_PASSWORD=HrmsPass@2024
export JWT_SECRET=$(openssl rand -hex 32)
export MAIL_USERNAME=noreply@yourcompany.com
export MAIL_PASSWORD=your-app-password
```

### 3. Start Backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run

# Verify: http://localhost:8080/api/actuator/health
# Swagger: http://localhost:8080/api/swagger-ui.html
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev

# App: http://localhost:5173
```

---

## 🐳 Docker Deployment <a name="docker"></a>

```bash
# Production build
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Scale backend (load balancing)
docker compose up -d --scale backend=2

# Stop
docker compose down

# Stop + delete data (WARNING!)
docker compose down -v
```

### Service URLs (Docker)
| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |
| MySQL | localhost:3306 |

---

## 📡 API Reference <a name="api"></a>

All endpoints are prefixed with `/api/v1/`

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register + auto-login |
| POST | `/auth/login` | Public | Login, get tokens |
| POST | `/auth/refresh` | Public | Refresh access token (rotation) |
| POST | `/auth/logout` | Public | Revoke refresh token |
| POST | `/auth/logout-all` | Bearer | Revoke all sessions |
| POST | `/auth/forgot-password` | Public | Send OTP to email |
| POST | `/auth/reset-password` | Public | Reset with OTP |
| POST | `/auth/verify-email` | Public | Verify email token |
| POST | `/auth/change-password` | Bearer | Change password |
| GET | `/auth/login-history` | Bearer | Get login history |

### Employees
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/employees?search=&page=0&size=10&sortBy=createdAt&sortDir=desc` | All | Paginated list |
| GET | `/employees/{id}` | All | Single employee |
| POST | `/employees` | ADMIN, HR | Create employee |
| PUT | `/employees/{id}` | ADMIN, HR | Update employee |
| DELETE | `/employees/{id}` | ADMIN | Soft delete |
| GET | `/employees/department/{id}` | All | By department |

### Leave
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/leaves/apply/{empId}` | All | Apply for leave |
| PUT | `/leaves/{id}/review` | ADMIN, HR, MANAGER | Approve/Reject |
| PUT | `/leaves/{id}/cancel/{empId}` | All | Cancel leave |
| GET | `/leaves/pending` | ADMIN, HR, MANAGER | Pending queue |
| GET | `/leaves/employee/{id}` | All | Employee history |

### Payroll
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/payroll/process?employeeId=&month=&year=` | ADMIN, HR | Process payroll |
| GET | `/payroll/employee/{id}` | All | Payslip list |
| GET | `/payroll/employee/{id}/slip?month=&year=` | All | Specific slip |

---

## 🔑 Default Credentials <a name="credentials"></a>

> ⚠️ **Change all passwords immediately in production!**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | Admin@123 |
| HR | hr@hrms.com | Hr@123 |
| Manager | manager@hrms.com | Manager@123 |
| Employee | emp@hrms.com | Emp@123 |

---

## 🌍 Environment Variables <a name="env"></a>

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | Yes | localhost | MySQL host |
| `DB_USERNAME` | Yes | root | MySQL username |
| `DB_PASSWORD` | Yes | — | MySQL password |
| `JWT_SECRET` | Yes | — | Min 32-char secret |
| `JWT_ACCESS_EXPIRY` | No | 900000 | Access token TTL (ms) |
| `JWT_REFRESH_EXPIRY` | No | 604800000 | Refresh token TTL (ms) |
| `MAIL_USERNAME` | Yes | — | SMTP username |
| `MAIL_PASSWORD` | Yes | — | SMTP password |
| `REDIS_PASSWORD` | No | — | Redis auth password |
| `FRONTEND_URL` | No | http://localhost:5173 | For email links |
| `CORS_ORIGINS` | No | http://localhost:5173 | Allowed origins |

---

## 🔄 CI/CD Pipeline <a name="cicd"></a>

GitHub Actions workflow triggers on push to `main` or `develop`:

```
Push to main
    │
    ├── backend-ci
    │     ├── Setup JDK 17
    │     ├── Maven: run tests (with MySQL service)
    │     ├── Maven: build JAR
    │     └── Docker: build & push to GHCR
    │
    ├── frontend-ci
    │     ├── Setup Node 20
    │     ├── npm ci + lint
    │     ├── npm run build
    │     └── Docker: build & push to GHCR
    │
    └── deploy (requires both jobs)
          ├── SSH into production server
          ├── docker compose pull
          ├── Rolling restart backend + frontend
          └── docker image prune
```

### Required GitHub Secrets
```
PROD_HOST         # Production server IP
PROD_USER         # SSH username
PROD_SSH_KEY      # SSH private key
SLACK_WEBHOOK_URL # (optional) Slack notifications
```

---

## 📁 Project Structure <a name="structure"></a>

```
hrms-platform/
├── backend/
│   ├── src/main/java/com/hrms/
│   │   ├── HrmsPlatformApplication.java
│   │   ├── config/          # Security, CORS, WebSocket, Rate Limiting
│   │   ├── controller/v1/   # REST endpoints (versioned)
│   │   ├── dto/             # Request / Response DTOs
│   │   ├── entity/          # JPA entities (15 tables)
│   │   ├── enums/           # All enum types
│   │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│   │   ├── repository/      # Spring Data JPA interfaces
│   │   ├── security/        # JWT, UserDetailsService, Filters
│   │   ├── service/impl/    # Business logic services
│   │   ├── scheduler/       # Scheduled tasks (token cleanup)
│   │   ├── audit/           # AuditorAwareImpl
│   │   └── util/            # OtpUtils, etc.
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── templates/email/ # Thymeleaf email templates
│   ├── src/test/            # Unit + integration tests
│   └── Dockerfile           # Multi-stage build
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API modules
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-based pages
│   │   ├── store/           # Redux Toolkit slices
│   │   ├── routes/          # ProtectedRoute
│   │   ├── pages/           # Dashboard, Profile
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilities
│   │   └── styles/          # Global CSS (Tailwind)
│   ├── Dockerfile           # Multi-stage build
│   └── nginx.conf           # (used inside container)
│
├── infra/
│   ├── nginx/nginx.conf     # Reverse proxy config
│   └── monitoring/          # Prometheus + Grafana configs
│
├── docs/
│   └── schema.sql           # Full DB schema + seed data
│
├── .github/workflows/       # GitHub Actions CI/CD
├── docker-compose.yml       # Full production stack
├── .env.example             # Environment template
└── README.md
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend && mvn test

# Specific test class
mvn test -Dtest=AuthServiceTest

# Coverage report
mvn test jacoco:report
# → open target/site/jacoco/index.html

# Frontend build verification
cd frontend && npm run build
```

---

## 🔒 Security Checklist (Production)

- [ ] Change all default passwords in `.env`
- [ ] Generate a strong JWT secret: `openssl rand -hex 32`
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Set `JPA_DDL=validate` (not `update`)
- [ ] Disable Swagger in prod: `springdoc.swagger-ui.enabled=false`
- [ ] Restrict CORS to your actual domain
- [ ] Set up firewall rules (only ports 80/443 public)
- [ ] Enable Redis password authentication
- [ ] Configure proper SMTP credentials
- [ ] Review and tighten RBAC permissions

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ — HRMS Platform v2.0 Enterprise Edition*
