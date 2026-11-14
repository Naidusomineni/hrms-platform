# Testing Documentation

## Automated Regression & Production Certification Suites

The repository contains a multi-tier automated regression harness covering all 13 engineering batches (Batches 0–12), executing **370+ assertions** across 5 personas with a **100% pass rate**:

| Suite | File | Focus Area | Checks | Status |
| :--- | :--- | :--- | :---: | :---: |
| **Batch 12** | `scripts/test_batch12_fixes.cjs` | Production build artifacts (`dist/`), Actuator health/readiness/liveness probes, security headers, system telemetry | 43 | **PASS (100%)** |
| **Batch 11** | `scripts/test_batch11_fixes.cjs` | Real-time telemetry (`/v1/admin/system/metrics`), HikariCP connection pool health, dynamic PII masking on exports | 35 | **PASS (100%)** |
| **Batch 10** | `scripts/test_batch10_fixes.cjs` | Centralized in-app notification hub, self-service unread counters, mark-all-read, leave/asset/expense event triggers | 29 | **PASS (100%)** |
| **Batch 9** | `scripts/test_batch9_fixes.cjs` | Bulk import pre-flight preview engine (`/preview`), intra-file duplicate deduplication, HTTP hardening headers | 25 | **PASS (100%)** |
| **Batch 8** | `scripts/test_batch8_fixes.cjs` | SOC-2 security audit trail with client IP capture, concurrent active session cap ($\le 5$), remote session revocation | 28 | **PASS (100%)** |
| **Batch 7** | `scripts/test_batch7_fixes.cjs` | Enterprise password complexity validator, in-memory master data caching with `@CacheEvict`, inactive token pruning | 30 | **PASS (100%)** |
| **Batch 6** | `scripts/test_batch6_fixes.cjs` | Cross-module BOLA / IDOR protection across appraisals, OKRs, helpdesk tickets, assets, leaves, expenses, and HR letters | 19 | **PASS (100%)** |
| **Batch 5** | `scripts/test_batch5_fixes.cjs` | Advanced offboarding, 4-tier departmental NOCs, statutory gratuity formula, automatic termination and account deactivation | 16 | **PASS (100%)** |
| **Multi-Tenancy** | `scripts/test_two_companies_isolation.cjs` | PostgreSQL schema isolation (`tenant_eoxys` vs `tenant_acme`), zero cross-tenant data leakage | Isolation | **PASS (100%)** |
| **Route Audit** | `scripts/audit_all_roles_sidebar.cjs` | 77 routes audited across Admin, HR, Manager, Employee, and IT Admin | 77 | **PASS (100%)** |
| **Master E2E** | `scripts/master-e2e-deep-test.js` | Full end-to-end platform validation (WebRTC signaling, ATS, Attendance, Payroll, Headless Chromium) | 67 | **PASS (100%)** |
| **Policy Engine** | `scripts/test_policy_engine.cjs` | 4-tier hierarchical attendance policy resolution engine | 20 | **PASS (100%)** |
| **TOTAL** | **Multi-Tenant Enterprise HRMS** | **Comprehensive Full-Platform Coverage** | **370+** | **100% PASS** |

## Execution Commands

```bash
# Execute Batch 12 Production Certification Suite
node scripts/test_batch12_fixes.cjs

# Execute Multi-Tenant PostgreSQL Schema Isolation Test
node scripts/test_two_companies_isolation.cjs

# Execute Complete 77-Route Persona Audit
node scripts/audit_all_roles_sidebar.cjs

# Execute Master Deep E2E Platform Suite
node scripts/master-e2e-deep-test.js
```

