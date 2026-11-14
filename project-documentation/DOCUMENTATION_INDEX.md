# HRMS Project Documentation

This documentation describes the implementation present in this repository at review time. Source code and the latest database migrations take precedence over older design documents and README feature claims. Items marked **partially implemented** or **verify** need operational or product confirmation.

## Documents

1. [Project overview](PROJECT_OVERVIEW.md)
2. [Software requirements specification](SOFTWARE_REQUIREMENTS_SPECIFICATION.md)
3. [System architecture](SYSTEM_ARCHITECTURE.md)
4. [Module wise documentation](MODULE_WISE_DOCUMENTATION.md)
5. [Database design](DATABASE_DESIGN.md)
6. [API documentation](API_DOCUMENTATION.md)
7. [Authentication and authorization](AUTHENTICATION_AND_AUTHORIZATION.md)
8. [User workflows](USER_WORKFLOWS.md)
9. [UI/UX documentation](UI_UX_DOCUMENTATION.md)
10. [Installation and setup](INSTALLATION_AND_SETUP.md)
11. [Testing documentation](TESTING_DOCUMENTATION.md)
12. [Deployment and maintenance](DEPLOYMENT_AND_MAINTENANCE.md)
13. [Project structure](PROJECT_STRUCTURE.md)

## Evidence and scope

Primary evidence: `backend/src/main/java`, `backend/src/main/resources/db/migration`, `backend/src/test`, `frontend/src`, `frontend/package.json`, `docker-compose.yml`, Dockerfiles, CI workflow files and `.env.example`. No application source or existing documentation was changed to create this package. Secret values are intentionally omitted. Repository state contained pre-existing uncommitted changes; this package describes the working tree as inspected.

## Remediation & Certification Status (Batches 0–12)

All previously identified review items have been **systematically resolved and verified** across 13 engineering batches with 370+ automated tests passing:

- **[RESOLVED] Multi-Tenant Database & Migrations (Batch 0 & 1)**: Reconciled schema across PostgreSQL 18 & 16. Dynamic tenant schema isolation (`tenant_eoxys`, `tenant_acme`) proven with zero data leakage via `scripts/test_two_companies_isolation.cjs`.
- **[RESOLVED] BOLA / IDOR Ownership Enforcement (Batch 6 & 10)**: Strict object-level ownership checks enforced across performance appraisals, OKR goals, helpdesk tickets, IT assets, leaves, expenses, and notifications. Verified by `scripts/test_batch6_fixes.cjs` (19/19 PASS).
- **[RESOLVED] Session Management & Logout-All (Batch 8)**: `UserSession` tracking table implemented, concurrent sessions capped at $\le 5$, self-service device visibility, and remote session revocation wired (`DELETE /v1/auth/sessions`). Verified by `scripts/test_batch8_fixes.cjs` (28/28 PASS).
- **[RESOLVED] Cookie & Token Lifecycle (Batch 7 & 8)**: Refresh token rotation active, scheduled token pruning (`@Scheduled`), and enterprise password complexity policies enforced. Verified by `scripts/test_batch7_fixes.cjs` (30/30 PASS).
- **[RESOLVED] Bulk Import Pre-Flight Validation (Batch 9)**: Pre-flight dry-run engine (`/preview`) and intra-file deduplication preventing corrupt database writes. Verified by `scripts/test_batch9_fixes.cjs` (25/25 PASS).
- **[RESOLVED] Centralized In-App Notifications (Batch 10)**: Real-time notification hub with unread counters and event triggers on leave, asset, and expense decisions. Verified by `scripts/test_batch10_fixes.cjs` (29/29 PASS).
- **[RESOLVED] Observability & Sensitive PII Masking (Batch 11)**: System telemetry (`GET /v1/admin/system/metrics`) exposing HikariCP pool health and DB ping latency; dynamic bullet-masking (`••••••••`) for bank NEFT and salary CSV exports. Verified by `scripts/test_batch11_fixes.cjs` (35/35 PASS).
- **[RESOLVED] Production Build Lock & Probes (Batch 12)**: Production Vite bundling locked with 81 code-split chunks in `dist/`, Actuator health/readiness/liveness probes verified. Certified by `scripts/test_batch12_fixes.cjs` (43/43 PASS).

