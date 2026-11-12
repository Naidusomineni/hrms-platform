# Application Inventory

## Scope and evidence

This inventory reflects the checked-out working tree, not just README claims. `git status` at audit start showed existing edits to application code, tests, documentation and package files. The audit did not reset or overwrite these changes. Secret values and demo passwords are intentionally omitted.

## Repository structure

| Path | Responsibility / evidence |
|---|---|
| `backend/` | Spring Boot Java API, Maven descriptor, profiles, Flyway migrations, email templates and two Java test classes. |
| `backend/src/main/java/com/hrms/config/` | Security chain, CORS, rate limiting, tenant/JWT integration, scheduling, WebSocket and application bootstrap. |
| `backend/src/main/java/com/hrms/modules/` | 22 domain packages with controllers/services/repositories/entities/DTOs. |
| `backend/src/main/java/com/hrms/entity/`, `repository/`, `dto/`, `security/`, `infrastructure/` | Shared identity/domain classes, data access, request/response models, JWT/security and tenant/storage/Redis adapters. |
| `backend/src/main/resources/db/migration/` | Flyway V1–V15. `V15__configurable_policies_and_workflow_engine.sql` and related source additions are in the current uncommitted tree. |
| `frontend/` | React/Vite SPA, feature pages, route composition, shared layouts, API clients, Redux slices and Playwright E2E. |
| `frontend/src/modules/` | 23 directories: 22 overlap backend modules plus frontend-only `profile`. |
| `frontend/src/api/`, `store/`, `routes/`, `components/`, `shared/` | Axios API clients, Redux Toolkit state, client route guard, UI components and alternate/shared layout implementations. |
| `infra/monitoring/` | Prometheus and Grafana configuration. |
| `.github/workflows/` | One CI/CD workflow file. Runtime success and deployment secrets were not verified. |
| `scripts/`, root `test_*.ps1` | Diagram/document helpers and multiple E2E/phase test scripts. These were inventoried; scripts requiring backend/database/services were not run without a designated test environment. |
| `docs/`, `storage/`, `logs/`, `project-documentation/` | Existing technical artifacts, local storage/log paths and prior documentation package. These were not overwritten. |
| `.env.example`, `docker-compose.yml`, `backend/src/main/resources/application*.properties` | Environment/configuration references. Tracked configuration contains credential defaults; actual values are deliberately not copied into this audit. `application-local.properties` is ignored and was not read. |

## Technology inventory

| Layer | Observed technologies |
|---|---|
| Backend | Java 21 target, Spring Boot 3.2.3, Spring MVC/Security/Data JPA, Hibernate, Flyway, PostgreSQL driver, H2 test profile, Redis client, Bucket4j, Spring Mail/Thymeleaf, WebSocket/STOMP, SpringDoc OpenAPI, Actuator/Micrometer/Prometheus, Lombok, Apache POI, JJWT and LiveKit token/signaling code. |
| Frontend | React 18, Vite 5.4.21, TypeScript/JavaScript, Redux Toolkit, React Router 6, Axios, Tailwind CSS, React Hook Form/Yup, Recharts, jsPDF, xlsx, LiveKit client, STOMP/SockJS, Playwright. |
| Data/runtime | PostgreSQL 16 in Compose; Redis 7.2; local filesystem storage; Docker Compose; Nginx frontend container; Prometheus and Grafana. |
| Browser testing | Playwright 1.60 configured for Chromium. Current tests cover only the login screen and mocked login flow. |
| Web/mobile | Browser SPA only. No Android, iOS, Flutter, React Native or other native mobile source directory was found. Responsive CSS is not evidence of a separately supported mobile application. |

## Module inventory

Backend: 22 packages; frontend: 23 feature directories. UI or API presence is **not** evidence that a workflow has been dynamically verified.

| Module | Backend package / principal surface | Frontend surface | Evidence status |
|---|---|---|---|
| Authentication | `modules/auth` (`AuthController`, `AuthService`, `TotpService`) | `modules/auth`, `authAPI.ts`, `authSlice.ts` | Implemented surface; critical route/session gaps. |
| Employee/profile | `modules/employee`, shared `Employee` | employee pages; `profile` page | Implemented surface; object ownership/tenant checks incomplete. |
| Department | `modules/department` | department page/API | CRUD surface present; deployment behavior not tested. |
| Attendance | `modules/attendance` | attendance page/service | Expanded punch, regularization and policy code; not dynamically tested. |
| Attendance policy | `modules/attendance` (`PolicyController`, `PolicyResolverService`) | policy config page/API | Hierarchical assignment source present; cross-tenant references need checks. |
| Leave | `modules/leave` | leave page/API | Request, policy and balance paths present; no end-to-end execution. |
| Requests/workflow | `modules/request`, `modules/workflow` | requests/approvals pages | Present; current-step/approver and ID scope deficiencies. |
| Payroll | `modules/payroll` | payroll page/API/PDF utility | Processing/review/export paths present; statutory/business correctness unverified. |
| Recruitment/interviews | `modules/recruitment` | ATS, lobby and interview room | Candidate/session/signaling/token paths present; provider readiness unverified. |
| Performance | `modules/performance` | performance page | Goals/reviews surface present; workflow and confidentiality not dynamically tested. |
| Expenses | `modules/expense` | expense claims page | Claims/review surfaces present; exact reimbursement lifecycle unverified. |
| Documents | `modules/document` | vault page/API | Upload/verification/download/acknowledgement/letter paths present; access risk. |
| Offboarding | `modules/offboarding` | offboarding page | Separation/clearance/settlement paths present; legal/settlement correctness unverified. |
| Shift/roster | `modules/shift` | shift roster page | Shifts/roster/swap APIs present; race and permission paths unverified. |
| Assets | `modules/asset` | asset page | Allocation/return surface present; employee ownership checks require review. |
| Helpdesk | `modules/helpdesk` | helpdesk page | Tickets/comments/stats present; access and SLA behavior unverified. |
| Communication | `modules/communication` | announcements page | Announcements and acknowledgement paths present. |
| Notifications | `modules/notification` | notifications page | REST and WebSocket paths present; delivery/subscribe authorization not verified. |
| Dashboard | `modules/dashboard` | dashboard page | Aggregation endpoints present; visibility and metric semantics not tested. |
| Reports/tax | `modules/report` | reports page | Analytics/tax surfaces present; accuracy/export/privacy unverified. |
| Workforce intelligence | `modules/intelligence` | intelligence page/API | Rule/service endpoints exist; no external generative model client verified. |
| Tenant administration | `modules/tenant` | tenant admin/module config pages | Tenant CRUD, branding and module manifest paths present; tenant boundary issue. |

## API inventory

27 controller classes contain 214 mapping annotations (GET/POST/PUT/PATCH/DELETE). The runtime servlet context defaults to `/api`; controller bases use `/v1`, so the default externally visible prefix is `/api/v1`. A reverse proxy, profile or environment override can change that. Exact routes and request/response DTO references are in [DATABASE_BACKEND_AUDIT.md](DATABASE_BACKEND_AUDIT.md) and each controller path below.

| Base route | Controller area |
|---|---|
| `/api/v1/auth` | `modules/auth/controller/AuthController.java` |
| `/api/v1/employees`, `/api/v1/departments` | Employee and department controllers |
| `/api/v1/attendance`, `/api/v1/policies` | Attendance and configurable policy controllers |
| `/api/v1/leaves` | Leave and leave-policy controllers |
| `/api/v1/requests`, `/api/v1/workflows` | Employee requests, approvals, definitions, delegation |
| `/api/v1/payroll`, `/api/v1/expenses` | Payroll and expense claims |
| `/api/v1/recruitment`, `/api/v1/recruitment/interviews` | Jobs/candidates and interview sessions/guests |
| `/api/v1/performance`, `/api/v1/documents`, `/api/v1/offboarding` | Performance, documents and separation/settlement |
| `/api/v1/shifts`, `/api/v1/assets`, `/api/v1/helpdesk` | Roster, assets and support tickets |
| `/api/v1/communication`, `/api/v1/notifications` | Announcements and notification read/delivery paths |
| `/api/v1/reports`, `/api/v1/dashboard`, `/api/v1/intelligence` | Analytics, dashboard and workforce intelligence |
| `/api/v1/admin`, `/api/v1/tenants`, `/api/v1/tenant/modules` | Platform administration, tenants, branding and feature manifest |

## Configured integrations

- PostgreSQL/JPA and Flyway scripts; app defaults disable Flyway and enable Hibernate `ddl-auto=update`.
- Redis-backed token blacklist adapter (fallback semantics require deployment verification).
- SMTP via Spring Mail and Thymeleaf email templates.
- Local filesystem upload/storage implementations. No S3/object-store adapter was found.
- STOMP/WebSocket notification and interview signaling surfaces.
- LiveKit-compatible signed interview token generation plus a frontend LiveKit client; actual provider reachability was not tested.
- Biometric JSON/CSV ingestion and device metadata surfaces; no vendor SDK/client or authenticated device integration was established.
- Prometheus scrape and Grafana datasource provisioning.
- Client-side PDF and spreadsheet generation; no external bank/payroll API client was identified.

## Automated test assets

Two Java test classes exist: `AuthServiceTest` and `AuthControllerIntegrationTest`. One Playwright file, `frontend/e2e/login.spec.js`, contains two scenarios. Additional root PowerShell and `scripts/*e2e*` files exist but require environment/safety review before execution. See [TEST_COVERAGE_REPORT.md](TEST_COVERAGE_REPORT.md).
