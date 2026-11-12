# Platform Security Audit

## Scope and limits

Static review covered Spring Security configuration, controller/method guards, JWT/session code, tenant filters, file services, CORS/WebSocket setup, browser token handling and tracked deployment configuration. No penetration test or hostile payload was sent to a live service. Findings below include the specific evidence and controlled reproduction plan; exploitability should be confirmed only on a disposable environment.

## Critical findings

### SEC-001 — Tracked credentials and bootstrap/demo accounts (P0)

- **Description / actual:** versioned `backend/src/main/resources/application.properties` and `docker-compose.yml` contain literal/default credential material. `DataInitializer` seeds role-labelled accounts whenever `userRepository.count() == 0`; `frontend/src/modules/auth/pages/LoginPage.jsx` embeds demo login credential values. Values are deliberately redacted here and must not be copied into tickets or docs.
- **Root cause:** development/demo bootstrap settings share production configuration paths, and the startup runner is not profile-gated.
- **Impact:** an empty production database may receive known/test identities; repository readers may obtain database/JWT/service access if any value is reused.
- **Controlled reproduction:** inspect source only; in an isolated database, verify whether a fresh startup seeds accounts and whether those identities authenticate. Never use a shared/live DB.
- **Remediation:** remove literals from tracked runtime config, require secret-manager injection and fail startup on absent/weak secrets; move demo seeding behind explicit local/test profile; remove demo credential UI from production bundles; rotate any deployed value.
- **Acceptance:** tracked source contains no usable secret/default credential; production startup cannot seed demo users; secrets are rotated and validated by CI scanning.

### SEC-002 — Tenant can be asserted during login and copied into JWT (P0)

- **Description / actual:** `TenantContextFilter` resolves the tenant from caller-supplied `X-Tenant-ID`/alternate header/query before authentication. `AuthService.login` finds a user by email and does not visibly compare their persisted tenant with current context. `JwtUtils.generateToken` writes `TenantContext.getTenantId()` as the JWT tenant claim; `JwtAuthenticationFilter` later restores that claim as context.
- **Affected API:** `POST /api/v1/auth/login`; subsequent tenant-scoped APIs.
- **Root cause:** tenant selection is trusted independently of authenticated identity.
- **Impact:** valid credentials for one tenant may mint a token scoped to another tenant, enabling cross-tenant reads/writes through endpoints that trust `TenantContext`.
- **Controlled reproduction:** in two disposable tenants, authenticate a tenant-A account while supplying tenant-B header; assert login is rejected and no token contains tenant B. Then assert all tenant-B IDs are inaccessible.
- **Remediation:** derive tenant from the authenticated user/account or a verified tenant membership; validate selected tenant membership on login and every request; reject mismatched tenant claims/header; use tenant+ID repository access.
- **Acceptance:** automated negative tests prove mismatch cannot mint a token or access tenant-B records across every module.

### SEC-003 — Sensitive account routes inherited from `/v1/auth/**` permit-all (P0)

- **Description / actual:** `SecurityConfig.PUBLIC_PATHS` permits all `/v1/auth/**`; `JwtAuthenticationFilter.shouldNotFilter` also skips auth paths. `AuthController` includes `login-history`, TOTP setup/enable/disable and logout-all; these methods do not have effective `@PreAuthorize` guards. `@SecurityRequirement` is documentation metadata only.
- **Impact:** unauthenticated callers can request another user’s login history and can initialize/replace another user’s TOTP secret; account controls may be invoked without identity. `logout-all` additionally reports success without revoking sessions.
- **Controlled reproduction:** on an isolated fixture, call each target-user route without bearer token and assert 401/403; then repeat with a different authenticated user ID and assert ownership denial.
- **Remediation:** replace broad auth wildcard permit-all with explicit public routes (register/login/refresh/verification/reset only); require authenticated principal and derive user ID server-side for account controls; add recent-credential/MFA confirmation where appropriate.
- **Acceptance:** unauthenticated requests fail; user A cannot read/change user B security settings; administrator access follows a written policy.

### SEC-004 — Employee/document IDOR and public static employee uploads (P0)

- **Description / actual:** `GET /api/v1/employees/{id}` is allowed to any authenticated user and `EmployeeService.getById` performs an ID lookup without owner/tenant scope. `DocumentController` upload/list/download/acknowledge/letter operations accept employee/document IDs and several lack method guards/owner checks. `EmployeeService.storeFile` writes resume files below the configured upload directory and returns `/uploads/...`; `WebMvcConfig` serves that directory and `SecurityConfig` permits `/uploads/**` publicly.
- **Impact:** unauthorized access to employee PII, resumes and HR documents; callers may create/acknowledge documents on another employee's record. Public URLs bypass API authentication entirely.
- **Controlled reproduction:** upload a synthetic document in a disposable tenant; request its `/uploads/...` URL without auth and attempt same-/cross-tenant ID substitution against employee/document APIs. No real personal data.
- **Remediation:** serve private files only through authenticated authorization-aware download service or signed, short-lived links; remove public static mapping for private uploads; enforce principal/tenant ownership on every ID operation; validate actual file signature and safe content disposition.
- **Acceptance:** unauthenticated URL access denied; same-tenant non-owner and cross-tenant ID tests deny; authorized owner/HR access audited.

### SEC-005 — Workflow inbox and approval decision lack approver/tenant binding (P0)

- **Description / actual:** `WorkflowEngineService.processApproval` loads `WorkflowInstance` via `findById(instanceId)` and does not visibly compare its tenant or the caller to the current step's `approverRole`/assignment. `getPendingTasksForUser(User)` ignores `user` and queries all tenant PENDING instances.
- **Affected API:** `GET /api/v1/workflows/inbox`, `POST /api/v1/workflows/tasks/{instanceId}/decision`.
- **Impact:** sensitive request/approval data exposure to all users in tenant; HR/manager caller may decide another approver's or foreign-tenant workflow if an ID is known and context is manipulated.
- **Controlled reproduction:** create two users and two workflow steps in a disposable tenant; verify non-assigned user cannot see or decide a task. Repeat across two tenants.
- **Remediation:** query inbox by authenticated user/role/team/delegation; load workflow by tenant+ID; validate step assignment and allowed transition under lock/version; audit decision.
- **Acceptance:** wrong role/user/tenant, stale/replayed and concurrent decisions fail atomically; authorized approver succeeds.

## High and medium findings

| ID | Severity | Finding and evidence | Required action |
|---|---|---|---|
| SEC-006 | P1 | `CorsConfig` includes wildcard origin patterns and credentials; `WebSocketConfig` allows `*`. | Use explicit trusted origins; test cookie-based refresh, STOMP handshake and subscription authorization. |
| SEC-007 | P1 | Refresh token is in `AuthResponse` and persisted in localStorage (`authSlice.ts`, `apiClient.ts`); cookie uses `secure(false)`. | Prefer HttpOnly Secure SameSite cookie-only refresh; production HTTPS and CSRF/origin controls. |
| SEC-008 | P1 | `AuthController.logoutAll` returns success without calling `AuthService.logoutAll`. | Revoke all user refresh tokens, clear cookie, test access/refresh invalidation. |
| SEC-009 | P1 | `EmployeeRequestService.reviewRequest` writes caller `action.toUpperCase()` directly and lacks a closed transition graph. | Allow only enumerated transitions and verify current state/role/tenant transactionally. |
| SEC-010 | P1 | Manual tenant filtering only; `BaseTenantEntity` populates `tenant_id` on insert but does not automatically scope reads. | Enforce tenant-scoped data access centrally or prove every repository/service query and relation lookup. |
| SEC-011 | P1 | OTP/MFA/account-control routes are broadly public; no evidence of endpoint-specific throttling. | Rate-limit OTP/reset/MFA by account and IP; enforce attempt/expiry/replay constraints. |
| SEC-012 | P2 | `RateLimitConfig` trusts first `X-Forwarded-For`, allocates an unbounded in-memory bucket per IP and applies only to login despite API-limit properties. | Trust only proxy-normalized client IP; bounded/distributed limiter; cover sensitive routes. |
| FILE-001 | P1 | Upload validation trusts client `Content-Type`; extension sanitizer is not a content scanner. | Check signatures, archive limits, malware/quarantine policy and private storage. |
| WS-001 | P1 | WebSocket origins wildcard; no complete inbound channel authorization/subscription policy was established. | Require authenticated handshake and authorize destinations per user/tenant; exercise cross-user subscribe/publish. |

## Additional controls observed

- Passwords are encoded with BCrypt cost 12 in `SecurityConfig`.
- Login failed-attempt counters and account lockout exist in `AuthService`.
- Refresh-token rotation/revocation is implemented in `AuthService.refreshToken`, but client storage and logout-all behavior weaken the overall session design.
- TOTP and backup-code support exists; TOTP secret storage and route guards need review.
- JWT filter checks a blacklist service; Redis availability/fallback behavior was not dynamically verified.
- CSRF is disabled in a stateless API configuration while refresh cookies are used. SameSite/cookie deployment behavior requires an explicit threat model.
- `application.properties` exposes health/info/metrics/prometheus and Swagger configuration. Validate public exposure and authorization at the reverse proxy.
- Nginx sets several security headers, but no Content-Security-Policy was found in the checked config; verify deployed headers.

## Manual confirmation required

Confirm whether tracked/default values have ever been deployed, whether demo seeding is enabled in production, the approved origin allowlist, refresh-token storage design, WebSocket identity binding, document classification, and retention/incident-response requirements. Never paste credential values into audit tickets.
