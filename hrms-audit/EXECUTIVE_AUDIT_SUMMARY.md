# Executive Audit Summary

**Review target:** current working tree at `hrms-platform-main` (11 November 2026)  
**Decision:** **Not production ready. Do not expose the current build to real employee or payroll data until the P0/P1 findings are contained and re-tested.**  
**Audit boundary:** source/configuration review, safe frontend checks, and inventory. No application source was changed.

## Executive view

This is a broad HRMS web application implemented as a React SPA and a Spring Boot modular monolith. The source contains employee, attendance, leave, workflow, payroll, recruitment, performance, expenses, documents, offboarding, asset, helpdesk, tenant, reporting and related surfaces. Source coverage is substantially broader than the automated test coverage.

Several issues are release-blocking because they affect credentials, tenant isolation, employee-document confidentiality, and approval authority. In particular, the tenant selected during authentication is derived from request context and copied into the JWT without an evident comparison to the authenticated user's tenant. The auth URL family is globally permit-all and contains account-management operations that are not individually protected. Employee and document APIs expose ID-based operations without consistent ownership/tenant checks. Workflow approvals load instances by unscoped ID and do not verify the configured approver for the current step. Tracked configuration and startup seeding also contain credential material; this report intentionally redacts all credential values.

## Findings by priority

| Priority | Finding IDs | Summary |
|---|---|---|
| **P0 – Critical** | SEC-001–SEC-005 | Tracked/default credentials and seeded demo users; tenant-context spoofing at login; public MFA/history routes; employee/document IDOR and public employee uploads; unbound workflow approval decisions. |
| **P1 – High** | SEC-006–SEC-011, DB-001–DB-002 | Wildcard credentialed CORS; browser-readable refresh tokens and insecure cookie flag; logout-all stub; unconstrained request states; manual tenant scope; sensitive auth throttling gap; PostgreSQL/Flyway mismatch and schema drift. |
| **P2 – Medium** | SEC-012, WF-001, UI-001, PERF-001–PERF-002 | Login limiter trusts forwarded IP headers and retains unbounded buckets; workflow inbox is unpaged; auth E2E selectors are stale; main frontend bundle is large; several page sizes lack consistent caps. |

Full issue records with reproduction guidance, evidence, impact, remediation and acceptance criteria are in [BUG_REGISTER.md](BUG_REGISTER.md). The register contains 18 findings: 5 P0, 8 P1, 5 P2 and 0 P3. Findings are static unless explicitly identified as dynamically observed; exploit scenarios were not executed against a live HRMS environment.

## Verification performed

- Enumerated 22 backend module packages, 23 frontend feature directories (including `profile`), 27 controller classes, 214 mapping annotations, 57 JPA entity classes, 15 Flyway migration files, and 56 frontend page-named files.
- `npm run type-check`: **PASS**.
- Frontend production build to an audit-only output directory: **PASS**, with a 1.19 MB main JS chunk, stale Browserslist data and a chunk-size warning.
- Existing Playwright login tests: **0/2 PASS**. The running UI does not match the test's old heading/placeholders; the second test timed out locating its old email placeholder. Test output is stored under this folder.
- Backend Maven tests: **BLOCKED** because Maven and a Maven wrapper are not available in this checkout/runtime.
- No backend was started and no database was connected: no designated disposable test database/account was supplied; Compose uses a persistent volume and source defaults, so it was not safe to treat it as a test database.
- No mobile client was found. No remote bank, biometric-vendor, SSO, or external AI provider was dynamically verified.

## Working-tree integrity

The initial repository already contained extensive modified and untracked application files. The audit describes the current working tree and preserves it. Generated audit documents, a frontend build output, and Playwright artifacts are inside `hrms-audit/`; no production application file was edited. Do not interpret this review as an audit of an earlier commit or a clean checkout.

## Recommended next step

Approve a controlled **P0 containment batch** before any other feature work: rotate/revoke all tracked/default credential material, disable/replace unsafe bootstrap identities, bind tenant identity to the authenticated account, protect sensitive auth routes, close IDOR/document and approval authorization gaps, and remove public serving of employee documents. Then run the explicit regression/tenant-isolation suite against a disposable database before progressing to P1.

This package completes the initial audit and remediation roadmap only. It does **not** implement fixes or issue a post-fix final application report; the fixing phase remains awaiting approval as requested.
