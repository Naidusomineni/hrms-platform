# Testing Documentation

## Test assets found

| Location | Type / purpose |
|---|---|
| `backend/src/test/java/com/hrms/service/AuthServiceTest.java` | Auth service unit tests |
| `backend/src/test/java/com/hrms/controller/AuthControllerIntegrationTest.java` | Auth controller integration tests |
| `backend/src/test/resources/application-test.properties` | Test configuration |
| `frontend/e2e/login.spec.js` | Playwright login E2E test |
| `frontend/playwright.config.js` | Browser test configuration |
| Root `test_phase*.ps1`, `test_it_service_desk_and_communication.ps1` | PowerShell API/feature test scripts |
| `run_senior_qa_e2e_tests.ps1` | Broader QA runner |
| `scripts/e2e-suite.js`, `master-e2e-deep-test.js`, `test_policy_engine.cjs` | JavaScript E2E/policy test assets |
| `frontend/test-results/` | Existing Playwright artifacts; not a fresh test run |

## Coverage and limitations

Visible committed tests emphasize authentication and selected workflow/module E2E scenarios. The test file inventory does not establish coverage for every controller, authorization boundary, tenant isolation query, migration, browser flow or external integration. Documentation generation did not execute tests. Existing output files and README test-count claims are not treated as current test results.

## Suggested verification areas

- Run Maven unit/integration tests with the intended PostgreSQL-compatible profile and validate full Flyway chain from a clean database.
- Run frontend build/typecheck and Playwright suite against a disposable configured environment.
- Add/confirm tests for role and ownership enforcement, cross-tenant IDOR attempts, JWT refresh/logout/replay, cookie flags, TOTP login enforcement, workflow transitions, payroll rounding, offboarding clearance gates, upload validation and storage access.
- Confirm database migration rollback/recovery strategy and concurrency tests for overlapping attendance/request and payroll processing operations.

These are recommendations only; no test or build was run for this documentation task.

