# Test Coverage and Execution Report

## Existing automated test inventory

| Test asset | Observed scope | Execution result |
|---|---|---|
| `backend/src/test/.../AuthServiceTest` | Auth service unit-level scenarios. | Not run; Maven is unavailable in the environment. |
| `backend/src/test/.../AuthControllerIntegrationTest` | Auth controller integration scenarios. | Not run; Maven is unavailable and no designated test DB/account was provided. |
| `frontend/e2e/login.spec.js` | Two login UI/mock flows. | **0/2 pass** in isolated local preview; selectors mismatch current UI. |
| Root `test_*.ps1` and `scripts/*e2e*` | Phase/module-specific test scripts, including attendance/payroll/offboarding/shift/intelligence/enterprise operations. | Inventoried but not executed; many require backend, database, accounts or external services and were not confirmed safe for an available environment. |

## Executed safe checks

| Check | Result | Notes |
|---|---|---|
| Frontend typecheck | **PASS** | `npm run type-check`. |
| Frontend production build | **PASS with warnings** | Output directed to `hrms-audit/frontend-build/`; 3,031 modules, main bundle about 1.194 MB, Vite chunk warning and stale Browserslist data. |
| Playwright login tests | **FAIL: 0/2 pass** | One expects outdated “Welcome back” heading; another waits for outdated `you@company.com` placeholder. Actual UI uses different labels. Results under `hrms-audit/playwright-test-results/`. Preview needed HTTPS due installed basic-SSL plugin; official config points to HTTP port 4173. |
| Backend Maven tests | **BLOCKED** | `mvn` command not recognized and no Maven wrapper exists in checkout. |
| Backend/API integration | **NOT RUN** | No safe disposable PostgreSQL/test service and test identities were provided; Compose volume/config was not used as a test database. |
| Tenant/security exploit checks | **NOT RUN** | Static findings only; no live cross-tenant or unauthorized mutation attempts. |
| Visual/responsive/accessibility sweep | **NOT RUN** | No full route-by-role browser audit was possible within a live backend environment. |

## Test quality findings

The automated suite is small relative to the source surface. The Java tests are auth-focused; frontend automation currently covers login only. There is no observed automated matrix for role access, tenant isolation, employee/document privacy, payroll calculation, workflow transitions, attendance concurrency, integrations, or recovery. The Playwright UI contract has drifted (UI-001).

## Required next test plan

1. Establish isolated test config and disposable PostgreSQL/Redis; correct migration/schema strategy first.
2. Create deterministic synthetic tenants and users for SUPER_ADMIN, ADMIN, HR, MANAGER, EMPLOYEE and IT_ADMIN plus dynamic tenant roles.
3. Add controller/service tests for object ownership, tenant context, role matrix and invalid transitions.
4. Add two-tenant cross-ID tests for employee, document, attendance, leave, payroll, reports, workflow, storage and notifications.
5. Add transactional/concurrency tests for approvals, payroll run/payment and attendance punch/regularization.
6. Add frontend tests using stable accessible labels and mocked API failure/success; align Vite preview protocol with Playwright.
7. Run complete module journeys with synthetic data and verify persistence, notifications, history and exports.
8. Add integration failure tests for SMTP, Redis, filesystem, WebSocket and interview provider; record no benchmark until load tests run.

## Status vocabulary

PASS only means the named executed check succeeded. FAIL means executed and failed. BLOCKED means the environment prevented execution. NOT RUN means intentionally not attempted. NOT VERIFIED means neither execution nor sufficient evidence supports a conclusion.
