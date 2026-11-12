# Database and Backend Audit

## Scope and limits

Static review of the current working tree's Spring Boot controllers, services, repositories, entities, configuration and migrations. There was no live database connection or backend test run. This report therefore distinguishes source observations from runtime behavior.

## Backend architecture

The API is a Spring Boot 3.2.3 modular monolith. The servlet context is configured as `/api`, while controllers generally declare `/v1/...`; the default external prefix is therefore `/api/v1`. Domain code is under `backend/src/main/java/com/hrms/modules/` and uses controller → service → repository → JPA entity patterns. Shared security, identity and tenant infrastructure is under `com/hrms/config`, `com/hrms/security`, and shared root packages. DTO validation and response envelopes vary by controller; no uniform contract was established across all 27 controllers.

## Persistence inventory

The current tree contains 57 JPA entity classes and Flyway migration files V1–V15. Core identity entities include `User`, `Employee`, `Tenant`, role/permission models and shared `BaseTenantEntity`. Domain entities cover attendance/policies, leave, workflow, payroll, recruitment/interviews, performance, expenses, documents, offboarding, shifts, assets, tickets, announcements, notifications, reports and intelligence. The inventory in [APPLICATION_INVENTORY.md](APPLICATION_INVENTORY.md) lists the observed modules.

The shared `BaseTenantEntity` assigns `tenant_id` at insert time from `TenantContext`; it does not itself apply a global read filter. Tenant isolation is therefore dependent on each repository/service query and each relationship lookup. This is a source-level risk, not proof that every query is vulnerable.

## Migration and schema findings

| ID | Observation | Evidence/status |
|---|---|---|
| DB-001 | V1 contains MySQL-specific DDL (`DROP INDEX`, `MODIFY COLUMN`, `ADD UNIQUE KEY`/`ADD INDEX`) while the configured runtime/Compose database is PostgreSQL. | Static incompatibility risk; migrations were not applied. See `backend/src/main/resources/db/migration/V1__...sql` and `docker-compose.yml`. |
| DB-002 | Application configuration disables Flyway by default and uses Hibernate `ddl-auto=update`. This can make a deployed schema depend on Hibernate auto-update rather than the checked-in migration history. | Static configuration observation; exact effective profile must be checked in deployment. |
| DB-003 | No central tenant query filter or database row-level security policy was identified in the reviewed source. | Static observation; database-level policies were not queried. |

Do not infer production schema from entity annotations alone. Confirm actual DDL, indexes, constraints, nullable columns, foreign keys, uniqueness and migration history in a disposable database before release.

## Backend behavior and controls

| Area | Source behavior observed | Audit concern |
|---|---|---|
| Authentication | `AuthService` supports login lockout, optional TOTP, refresh flow, reset/verification and a logout-all service method. | `/v1/auth/**` is permit-all at the security layer; sensitive controller routes need endpoint-specific identity and privilege checks. `logoutAll` controller does not invoke the service method. |
| Employee lookup | `EmployeeService.getById` uses `findById`; `GET /api/v1/employees/{id}` requires authentication. | Authenticated identity is not checked against the requested employee ID in the observed path. |
| Documents | `DocumentController` accepts employee/document identifiers for upload, list, download, acknowledgement and letter operations. | Several operations lack visible owner/tenant binding. Employee profile files are web-served from `/uploads/**`; the vault storage adapter has a separate tenant path check and should not be conflated with those profile uploads. |
| Approval engine | `WorkflowEngineService` loads approval instances by ID. Inbox retrieval is not user-specific and is unpaged. | Current-step approver authorization is not evident; decision API needs ID, tenant and actor binding. |
| Employee requests | `EmployeeRequestService` accepts employee IDs and writes uppercased action text. | Request ownership and allowed state transitions need backend enforcement. |
| Transactions/concurrency | Transaction annotations and locking/version patterns are not consistently evident across domain services. | Duplicate submissions, simultaneous decisions, payroll-run idempotence and lost updates remain unverified. |
| Pagination | Some controllers accept page/size directly into `PageRequest.of`. | No consistent maximum page size was found; unbounded or extreme requests can stress database and serialization. |
| Validation/errors | DTO validation, exception mapping and response shapes vary. | API consumers need an endpoint-by-endpoint contract and failure-path tests. |

## API route families

The default route families below were derived from controller mappings; this is an inventory, not a promise that every operation is correctly authorized or deployable.

| Prefix | Controller/module |
|---|---|
| `/api/v1/auth` | `AuthController` |
| `/api/v1/employees`, `/api/v1/departments` | Employee and department controllers |
| `/api/v1/attendance`, `/api/v1/policies` | Attendance and `PolicyController` |
| `/api/v1/leaves` | Leave and leave policy |
| `/api/v1/requests`, `/api/v1/workflows` | Employee requests and workflow engine |
| `/api/v1/payroll`, `/api/v1/expenses` | Payroll and expenses |
| `/api/v1/recruitment` | ATS and interview controllers |
| `/api/v1/performance`, `/api/v1/documents`, `/api/v1/offboarding` | Performance, document and separation operations |
| `/api/v1/shifts`, `/api/v1/assets`, `/api/v1/helpdesk` | Roster, asset and support APIs |
| `/api/v1/communication`, `/api/v1/notifications` | Announcements and notification APIs |
| `/api/v1/reports`, `/api/v1/dashboard`, `/api/v1/intelligence` | Analytics and insights |
| `/api/v1/admin`, `/api/v1/tenants`, `/api/v1/tenant/modules` | Platform and tenant administration |

Exact methods and DTO schemas should be generated from the running OpenAPI document after the database/configuration mismatch is resolved. Static mapping count: 214 mappings across 27 controllers.

## Findings and actions

See [BUG_REGISTER.md](BUG_REGISTER.md) for full evidence and acceptance criteria. Priority is to reconcile PostgreSQL with migrations, choose a single schema-management strategy, enforce tenant scoping at query boundaries, add constraints and transaction/locking semantics for high-value state transitions, cap pagination, and verify API contracts with integration tests. The audit did not apply migrations or alter backend code.
