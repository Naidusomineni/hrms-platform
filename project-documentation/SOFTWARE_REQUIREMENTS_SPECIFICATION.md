# Software Requirements Specification

## 1. Purpose and scope

This SRS records observable requirements implied by the current source code. It is not a signed product specification. Requirement identifiers below are descriptive and do not imply contractual acceptance.

## 2. User classes

| User class | Evidence in code | Expected access pattern |
|---|---|---|
| Employee | `Role.ROLE_EMPLOYEE`, employee UI, self-service endpoints | Profile, attendance, leave, requests, documents, notifications, expenses and related self-service features |
| Manager | `ROLE_MANAGER`, approval and operational endpoints | Review workflows, attendance/shift requests, team operations where implemented |
| HR | `ROLE_HR` | Employee, leave, attendance, payroll, recruiting and policy administration according to endpoint guards |
| Tenant administrator | `ROLE_ADMIN` | Tenant-level administration, configuration and operational controls |
| Super administrator | `ROLE_SUPER_ADMIN` | Cross-tenant administration and selected elevated operations |
| IT roles | `ROLE_IT_ADMIN`, `ROLE_IT_SUPPORT` | Selected admin, asset and helpdesk operations |

Role names are not a complete permission matrix; route and method guards vary. See [authorization](AUTHENTICATION_AND_AUTHORIZATION.md).

## 3. Functional requirements

| ID | Requirement supported by code | Principal evidence |
|---|---|---|
| FR-01 | Users can register/login, verify email, refresh/logout, change/reset passwords, review login history and configure TOTP. | `AuthController`, `AuthService`, `TotpService` |
| FR-02 | Authorized users can create, search, view, update and soft-delete employee and department records; employees can access profile-related surfaces. | `EmployeeController`, `DepartmentController`, services |
| FR-03 | Attendance records can be recorded, queried and updated; punch, break, biometric, regularization and office-location paths are exposed. | `AttendanceController`, `AttendanceService`, migrations V3/V6/V15 |
| FR-04 | Leave applications, reviews, cancellation, leave policies, balances and accrual operations are exposed. | `LeaveController`, `LeavePolicyController`, `LeaveService`, schedulers |
| FR-05 | Employee requests and configurable workflows can be submitted and reviewed; workflow definitions and approval delegations can be queried/managed. | `EmployeeRequestController`, `WorkflowController`, `WorkflowEngineService` |
| FR-06 | Payroll can be processed, reviewed/adjusted, approved, marked paid, summarized, and exported for bank batch workflows. | `PayrollController`, `PayrollService` |
| FR-07 | Job postings/candidates can be managed, candidate stages and scorecards updated, candidates converted; interviews support guest join and signaling routes. | Recruitment and interview controllers/services |
| FR-08 | Performance cycles, employee goals, goal progress and reviews can be managed. | `PerformanceController`, `PerformanceService` |
| FR-09 | Expenses can be submitted and reviewed; helpdesk tickets/comments, announcements and acknowledgements are supported. | Corresponding module controllers/services |
| FR-10 | Documents can be uploaded, listed, verified, downloaded, acknowledged; HR letters can be generated. | `DocumentController`, `DocumentService` |
| FR-11 | Offboarding/separation, clearance and settlement operations are exposed. | `OffboardingController`, `OffboardingService` |
| FR-12 | Shift definitions, roster assignments, shift swaps and peer/manager review operations are exposed. | `ShiftRosterController`, `ShiftRosterService` |
| FR-13 | Tenants can be inspected/configured and branded; tenant module manifests can be read and toggled. | Tenant/admin controllers and services |
| FR-14 | Dashboard, reports, notifications, assets and workforce intelligence functions are available through APIs and UI routes. | Module controllers and frontend pages |

## 4. Non-functional requirements visible in implementation

- **NFR-01 Security:** stateless Spring Security filter chain, JWT bearer parsing, BCrypt encoder, method-level authorization, CORS configuration, login/API rate limiting configuration and audit support are present. Configuration needs production review.
- **NFR-02 Tenant separation:** tenant ID is resolved from headers, query parameter, or host subdomain and stored in `TenantContext`; `BaseTenantEntity` and tenant-aware repositories support isolation. Verify every query and object ownership path.
- **NFR-03 Persistence:** JPA/Hibernate and Flyway are configured; PostgreSQL is the intended database for current profile/configuration.
- **NFR-04 Operability:** Spring Actuator, Micrometer Prometheus, Docker Compose and monitoring configuration exist.
- **NFR-05 Usability:** SPA routes, responsive utility classes, charts, file upload and error-boundary components are present. No accessibility conformance statement is verified.

## 5. Out of scope or not verified

No supported evidence establishes statutory compliance in any jurisdiction, integration with a real bank/biometric vendor, an external HRIS/identity provider, a production AI provider, guaranteed encryption at rest for file storage, formal disaster recovery objectives, or complete approval SLA enforcement. The code contains data structures and endpoints that may be prototypes or partial implementations.

## 6. Assumptions and questions

1. Confirm intended deployment database and migration history (V1 dialect concern).
2. Confirm which roles should own each self-service action and whether employee ID ownership is enforced.
3. Confirm payroll formulas and statutory assumptions with a qualified domain owner.
4. Confirm if the live interview signaling implementation is production-ready and which media provider is active.
5. Confirm retention, privacy, backup, audit and data residency requirements.

