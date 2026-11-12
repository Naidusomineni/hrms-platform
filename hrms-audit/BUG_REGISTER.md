# Bug and Risk Register

## Severity and evidence rules

P0 is a release blocker with potential for credential compromise, cross-tenant access, sensitive-data exposure or unauthorized business decisions. P1 materially weakens controls or breaks a core workflow. P2 is a moderate functional, quality or performance issue. Findings below are static code/config findings unless explicitly identified as executed. No exploit was run against a live system. Credentials are intentionally redacted.

## Findings

### SEC-001 — Tracked configuration and bootstrap/demo credentials (P0)

- **Module:** Configuration / authentication.
- **Description:** Tracked runtime configuration, Compose defaults, `DataInitializer` bootstrap users and frontend demo UI contain credential material or seeded account values.
- **Reproduction:** Inspect tracked `backend/src/main/resources/application.properties`, `docker-compose.yml`, `backend/src/main/java/com/hrms/config/DataInitializer.java`, and `frontend/src/modules/auth/pages/LoginPage.jsx`. Values intentionally omitted.
- **Expected:** Production secrets come from a secret manager/environment injection; bootstrap identities are disabled or explicitly one-time and forced to rotate credentials; no demo credentials in production UI.
- **Actual:** Values/defaults and seed logic are present in tracked/current source; `DataInitializer` seeds when user count is zero without an observed profile restriction.
- **Root cause:** Development/demo bootstrap values share production-capable config paths.
- **Affected:** Listed files; application startup and deployment config.
- **Impact:** Account takeover if defaults or seeded identities are reachable; secrets committed to VCS cannot be considered confidential.
- **Evidence:** Static source/config inspection only; values redacted.
- **Remediation:** Rotate/revoke any deployed or repository-exposed values, move secrets to managed injection, guard bootstrap by explicit non-production profile/one-time mechanism, remove demo credential UI from production build.
- **Tests:** Secret scanning; production profile starts without demo accounts; bootstrap disabled; credential rotation validated.
- **Acceptance:** No active secret/default credential in tracked deployable config; production cannot create demo identities; old values revoked.

### SEC-002 — Tenant context can be asserted at login (P0)

- **Module:** Tenant/authentication.
- **Description:** Request-supplied tenant context is copied to the JWT without visible comparison to the authenticated user's persisted tenant.
- **Reproduction:** In a disposable two-tenant environment, submit a valid tenant-A user's login while supplying tenant-B context through the tenant header/query/host path accepted by `TenantContextFilter`; inspect resulting token claims and tenant-scoped reads. Do not run against production.
- **Expected:** Tenant is derived from authenticated identity or a verified membership, and any requested tenant switch requires explicit membership/authorization.
- **Actual:** `TenantContextFilter` accepts request context; `JwtUtils.generateToken` places current tenant in `tenant_id`; `AuthService.login` finds by email without the observed persisted-tenant comparison; JWT filter then restores claim to context.
- **Root cause:** Trust boundary allows unauthenticated request context to define authenticated tenant claim.
- **Affected:** `TenantContextFilter`, `JwtUtils`, `AuthService`, `JwtAuthenticationFilter`; all tenant-scoped APIs.
- **Impact:** Potential cross-tenant access and data disclosure/corruption.
- **Evidence:** Static call-path analysis; no cross-tenant exploit executed.
- **Remediation:** Derive tenant from user membership, validate membership/active status before token issue, bind tenant claim to server-side authorization and reject mismatches.
- **Tests:** Two-tenant adversarial login, token claim assertions, tenant switch membership and every representative data API.
- **Acceptance:** A tenant-A-only identity cannot receive tenant-B context/token or access tenant-B records; authorized multi-tenant membership is explicit and tested.

### SEC-003 — Public auth route family includes sensitive account operations (P0)

- **Module:** Authentication/MFA.
- **Description:** `/v1/auth/**` is permit-all and JWT auth filter skips that prefix, including user-ID-based login history and TOTP setup/enable/disable routes.
- **Reproduction:** Call sensitive auth routes without a bearer token in a controlled test deployment and vary target `userId`.
- **Expected:** Only login/registration/recovery initiation routes are selectively public; history and MFA management require authenticated owner plus reauthentication/privileged checks.
- **Actual:** Broad URL rule applies; no equivalent endpoint-specific method guard was observed for those operations. Swagger security metadata does not enforce authorization.
- **Root cause:** Blanket public matcher with incomplete per-route authorization.
- **Affected:** `SecurityConfig`, `JwtAuthenticationFilter`, `AuthController` and MFA services.
- **Impact:** Account/MFA manipulation or history disclosure.
- **Evidence:** Static security matcher/controller review; not dynamically exercised.
- **Remediation:** Replace broad matcher with explicit public route allowlist; enforce principal-to-user binding and step-up verification for MFA changes.
- **Tests:** Anonymous and cross-user calls rejected; owner flow requires recent authentication; recovery public flows remain functional.
- **Acceptance:** Only documented public endpoints work anonymously; all sensitive routes deny anonymous and unauthorized user-ID substitution.

### SEC-004 — Employee/document IDOR and public employee upload path (P0)

- **Module:** Employee/document privacy.
- **Description:** ID-based employee and document operations do not consistently bind target object to caller/tenant; employee profile upload URLs are served publicly.
- **Reproduction:** In synthetic environment, compare employee A/B identity requests to `GET /api/v1/employees/{id}` and document list/download/acknowledgement/generate operations; inspect unauthenticated `/uploads/...` response.
- **Expected:** Owner/authorized HR access and tenant scope are checked per operation; private files require authorization and short-lived delivery.
- **Actual:** `EmployeeService.getById` uses ID lookup; multiple `DocumentController` operations lack visible owner checks. `EmployeeService.storeFile` uses configured upload directory and returns `/uploads/...`; `WebMvcConfig` maps it and `SecurityConfig` permits `/uploads/**`.
- **Root cause:** Identifier-based access and static file mapping bypass domain authorization.
- **Affected:** `EmployeeController/Service`, `DocumentController/Service`, `WebMvcConfig`, `SecurityConfig`, `file.upload.base-dir`.
- **Impact:** Exposure/modification of personal documents and employee PII.
- **Evidence:** Static source review; no employee data accessed.
- **Remediation:** Enforce object-level authorization and tenant filters; store private files outside web root; serve via authorized endpoint or expiring signed access; verify file signature and content policy.
- **Tests:** Anonymous access denied; employee A cannot read/write B records/files; HR permissions are tenant-bounded; traversal/MIME tests.
- **Acceptance:** All sensitive object/file reads and writes have negative cross-user and cross-tenant tests; static URL cannot expose private content.

### SEC-005 — Approval decision lacks current approver binding (P0)

- **Module:** Workflow/approvals.
- **Description:** Workflow decision path loads an instance by raw ID without visible check that caller is assigned to the current step; inbox retrieval ignores supplied user.
- **Reproduction:** In synthetic two-user workflow, create pending instance for approver A and call decision endpoint as unrelated employee B using instance ID.
- **Expected:** Current step, tenant, actor/role/delegation and allowed transition are validated atomically.
- **Actual:** `WorkflowEngineService.processApproval` uses `instanceRepository.findById(instanceId)`; `getPendingTasksForUser(User)` ignores user and returns tenant-wide pending queue.
- **Root cause:** Decision and inbox operate on instance identifiers/tenant scope without assignment authorization.
- **Affected:** `WorkflowEngineService`, workflow controller/repositories and approval UI.
- **Impact:** Unauthorized approval/rejection and visibility of pending employee requests.
- **Evidence:** Static source call path; no unauthorized decision executed.
- **Remediation:** Query task by tenant + assigned approver/authorized delegation + active step; enforce transitions and write in a transaction with concurrency protection.
- **Tests:** Wrong user, wrong role, stale step, foreign tenant, delegated approver, parallel decision and audit-history scenarios.
- **Acceptance:** Only current assigned approver/delegate can decide; inbox contains only authorized tasks; one concurrent decision succeeds.

### SEC-006 — Wildcard credentialed CORS and WebSocket origins (P1)

- **Module:** Web/API transport.
- **Description:** `CorsConfig` permits wildcard origin patterns together with credentials; `WebSocketConfig` allows `*` patterns.
- **Reproduction:** Inspect configuration and test origin negotiation from untrusted origins in isolated environment.
- **Expected/actual:** Expected explicit trusted origins. Actual source allows broad patterns; runtime browser behavior depends on framework/deployment.
- **Root cause:** permissive development origin settings.
- **Affected:** `CorsConfig`, `WebSocketConfig`, browser API and STOMP endpoints.
- **Impact:** Cross-origin request/socket exposure depending on credentials and browser policy.
- **Remediation:** Environment-specific explicit origin allowlist; secure STOMP connect and per-topic authorization.
- **Tests/acceptance:** Approved origins succeed; untrusted origins fail for HTTP and WebSocket; subscription authorization checked.

### SEC-007 — Refresh token stored in browser-readable storage (P1)

- **Module:** Auth/session.
- **Description:** Refresh token appears in API response and frontend localStorage; refresh cookie uses `secure(false)`.
- **Reproduction:** Inspect `AuthResponse`, `authSlice.ts`, `apiClient.ts`, and cookie builder.
- **Expected:** Production refresh credential protected from script access and transmitted only under secure transport with appropriate SameSite/CSRF controls.
- **Actual:** Browser JS persistence and insecure cookie flag are present in source.
- **Root cause:** SPA token persistence design lacks production-hardening split.
- **Affected:** Auth response/configuration and frontend auth storage.
- **Impact:** XSS can expose long-lived refresh capability; cookie may be sent over insecure transport in relevant deployment.
- **Remediation:** Prefer HttpOnly, Secure, SameSite cookie-only refresh; rotate/revoke server-side; define CSRF/origin controls.
- **Tests/acceptance:** Refresh secret unreadable to JS; HTTPS cookie flags correct; rotation/replay/revocation verified.

### SEC-008 — Logout-all endpoint is a success stub (P1)

- **Module:** Auth/session.
- **Description:** `AuthController.logoutAll` returns success without invoking the existing `AuthService.logoutAll` service.
- **Reproduction:** Log in from two sessions, call logout-all, then attempt refresh from both.
- **Expected:** All refresh sessions revoked and cookie cleared.
- **Actual:** Controller does not call service revocation path.
- **Root cause:** Controller response is not wired to service behavior.
- **Affected:** `AuthController`, `AuthService`, refresh token repository.
- **Impact:** Users/admins cannot invalidate compromised sessions as advertised.
- **Remediation/tests:** Invoke revocation transaction and test all prior refresh tokens rejected. Acceptance: no prior session can refresh after success.

### SEC-009 — Request state action is not constrained (P1)

- **Module:** Employee requests.
- **Description:** `EmployeeRequestService.reviewRequest` accepts `action.toUpperCase()` without a closed status transition map and loads request without sufficient tenant/owner binding.
- **Reproduction:** Submit invalid transition or foreign request ID in synthetic test data.
- **Expected:** Only role-authorized transitions from current state are accepted.
- **Actual:** Caller string is assigned as state in reviewed path.
- **Root cause:** State transition policy is implicit/unvalidated.
- **Affected:** `EmployeeRequestService`, request controller/DTO/entity.
- **Impact:** Invalid state, bypassed review and inconsistent downstream reports.
- **Remediation/tests:** Enumerated transition state machine, actor/tenant checks, transaction and concurrency guards. Acceptance: invalid/stale actions rejected with unchanged record.

### SEC-010 — Tenant isolation depends on manual filtering (P1)

- **Module:** Cross-cutting persistence.
- **Description:** Tenant ID assignment on insert is present, but no global read filter/RLS was found; numerous ID-only access patterns exist.
- **Reproduction:** Review each tenant-owned repository/service lookup and use synthetic foreign-tenant IDs after SEC-002 fix.
- **Expected/actual:** Expected tenant predicate on all reads/writes and relationships. Actual enforcement is distributed and inconsistent by source inspection.
- **Root cause:** Tenant boundary is not centrally enforced.
- **Affected:** `BaseTenantEntity`, repositories/services across domain modules.
- **Impact:** Cross-tenant data leakage or mutation where an unscoped lookup is reachable.
- **Remediation/tests:** Central tenant-scoped repository/query strategy or verified exhaustive filters; optional DB RLS; negative tests for every sensitive object class.
- **Acceptance:** Foreign tenant IDs consistently return not found/forbidden and no mutation occurs.

### SEC-011 — Sensitive auth operations lack demonstrated throttling (P1)

- **Module:** Authentication/MFA.
- **Description:** Rate limiter is applied to login, but no route-level throttle was evidenced for OTP, reset, verification and MFA/account-control routes.
- **Reproduction:** In test environment, submit repeated recovery/MFA challenges and inspect limits/lockout/telemetry.
- **Expected/actual:** Expected per-account + IP throttles and bounded OTP attempts; source review does not establish consistent enforcement across these routes.
- **Root cause:** Limited scope of login-only limiter and broad public auth family.
- **Affected:** Auth controllers/services and `RateLimitConfig`.
- **Impact:** Enumeration, OTP guessing or abuse of email/SMS resources.
- **Remediation/tests:** Add distributed, account-aware limits with safe error responses, expiry and audit telemetry. Acceptance: attempts are bounded without account-existence leakage.

### SEC-012 — Login rate limiter trusts forwarded IP and retains buckets (P2)

- **Module:** API abuse controls.
- **Description:** `RateLimitConfig` trusts first `X-Forwarded-For` and uses unbounded `ConcurrentHashMap` buckets; observed application applies it only to login.
- **Reproduction:** Send spoofed forwarded IP values and generate many unique addresses in isolated test.
- **Expected/actual:** Expected trusted proxy normalization, bounded/distributed state and route coverage. Actual source trusts caller-influenced header and retains map entries.
- **Root cause:** In-memory limiter lacks trusted proxy integration and eviction.
- **Affected:** `RateLimitConfig` and login path.
- **Impact:** Rate-limit evasion and memory growth under address churn.
- **Remediation/tests:** Trust forwarding headers only from configured proxies; bounded/distributed limiter with expiry. Acceptance: spoofing fails and bucket count remains bounded.

### DB-001 — Flyway V1 dialect conflicts with PostgreSQL target (P1)

- **Module:** Database/deployment.
- **Description:** V1 uses MySQL-specific index/column syntax while Compose/runtime targets PostgreSQL.
- **Reproduction:** Apply migrations on disposable PostgreSQL instance.
- **Expected/actual:** Expected clean, repeatable PostgreSQL migration. Actual migration contains incompatible DDL; no live application attempt was made.
- **Root cause:** Database dialect drift in migration history.
- **Affected:** `backend/src/main/resources/db/migration/V1__...sql`, database config and deployment.
- **Impact:** Fresh environment may fail to initialize or drift from entity schema.
- **Remediation/tests:** Reconcile migration history using supported PostgreSQL migrations and test clean upgrade path from supported starting versions.
- **Acceptance:** Fresh PostgreSQL migration and upgrade succeed with constraints validated.

### DB-002 — Schema managed by Hibernate update while Flyway disabled (P1)

- **Module:** Persistence/deployment.
- **Description:** Default config disables Flyway and enables `ddl-auto=update`.
- **Reproduction:** Inspect application config and effective deployment profile.
- **Expected/actual:** Expected explicit migration-managed schema. Actual default path permits runtime schema drift; effective prod override is unknown.
- **Root cause:** Development schema convenience is the default configuration.
- **Affected:** application properties/profiles, migration history.
- **Impact:** Unreviewed DDL, inconsistent environments and difficult rollback.
- **Remediation/tests:** Set production profile to validated Flyway-only schema strategy and Hibernate validate; test startup against migrated database.
- **Acceptance:** Production startup does not alter schema; migration plan is repeatable and rollback policy documented.

### WF-001 — Workflow queue is unpaged and per-row mapping reads (P2)

- **Module:** Workflow/performance.
- **Description:** User parameter is ignored and task mapping performs extra reads for tenant pending instances.
- **Reproduction:** Call pending-task route with large synthetic queue and inspect query count/response size.
- **Expected/actual:** Expected assignee-scoped paging and bounded query count. Actual unpaged tenant list with per-row reads.
- **Root cause:** Inbox implementation is not user-scoped or projection/batch optimized.
- **Affected:** `WorkflowEngineService`, workflow repository/controller.
- **Impact:** Data exposure (SEC-005) and load growth.
- **Remediation/tests:** Join-filter by authorized actor, page results, use projection/fetch strategy. Acceptance: correct user scope and bounded SQL count/page size.

### UI-001 — Login E2E selectors stale (P2)

- **Module:** Frontend QA.
- **Description:** Existing Playwright login tests look for labels no longer rendered by `LoginPage.jsx`.
- **Reproduction:** Run configured login E2E tests against isolated frontend preview.
- **Expected/actual:** Expected tests reflect current UX and execute both valid/invalid mocked flows. Actual suite result 0/2 pass; one heading assertion and one old email placeholder fail.
- **Root cause:** UI and E2E selector contract drift; config also defaults to HTTP while preview uses HTTPS with basic SSL.
- **Affected:** `frontend/e2e/login.spec.js`, `frontend/playwright.config.js`, LoginPage.
- **Impact:** Regression checks are currently noisy/unusable for login.
- **Remediation/tests:** Update semantic selectors and align preview protocol; rerun with test report. Acceptance: deterministic tests assert visible labels and mocked result without stale text.

### PERF-001 — Large frontend initial bundle (P2)

- **Module:** Frontend performance.
- **Description:** Build emits approximately 1.194 MB main JS chunk and Vite chunk warning.
- **Reproduction:** `npm run build -- --outDir ../hrms-audit/frontend-build`.
- **Expected/actual:** Expected budgeted/lazy-loaded feature chunks. Actual warning observed; no runtime latency measured.
- **Root cause:** Large dependency/route graph bundled together (exact contribution needs analyzer).
- **Affected:** Frontend route composition and build config.
- **Impact:** Potential slower startup on limited networks/devices.
- **Remediation/tests:** Inspect bundle analyzer, lazy load feature routes and set measured budgets. Acceptance: agreed compressed transfer budget met and smoke checks pass.

### PERF-002 — Pagination inputs lack a consistent cap (P2)

- **Module:** API/database.
- **Description:** Some endpoints pass requested size directly into `PageRequest.of`.
- **Reproduction:** Submit oversized page-size parameters in a disposable test environment.
- **Expected/actual:** Expected validated bounded page size. Actual mixed limits; no uniform cap evidenced.
- **Root cause:** Endpoint-level pagination implementations are inconsistent.
- **Affected:** Controllers using raw page/size parameters.
- **Impact:** Excessive query/response work or exceptions.
- **Remediation/tests:** Central page request validation and maximum; boundary and abuse tests.
- **Acceptance:** All pageable endpoints reject or clamp invalid/extreme values consistently.

## Issue count and disposition

| Severity | Count | Status |
|---|---:|---|
| P0 | 5 | Open; implementation not approved or performed. |
| P1 | 8 | Open; implementation not approved or performed. |
| P2 | 5 | Open; includes known test/UI/performance concerns. |
| P3 | 0 recorded | No cosmetic-only issue promoted without evidence. |

Counts include SEC-001–005 (P0); SEC-006–011 plus DB-001/DB-002 (P1); and SEC-012, WF-001, UI-001, PERF-001 and PERF-002 (P2). **Total: 18 findings.** Findings are not marked fixed.
