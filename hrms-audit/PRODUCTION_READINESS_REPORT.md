# Production Readiness Report

**Assessment date:** 11 November 2026  
**Recommendation:** **Not production ready for real employee or payroll data.**

## Readiness snapshot

| Domain | Rating | Evidence |
|---|---|---|
| Product breadth | Partial | Broad source surface across 22 backend packages and 23 frontend feature folders; workflows not fully exercised. |
| Authentication | Not ready | Broad public auth route matcher includes sensitive routes; logout-all is a stub; browser refresh-token storage and credential defaults need resolution. |
| Authorization/data privacy | Not ready | Tenant claim can be request-derived at login; ID-based employee/document operations and public upload path lack consistent protection; approval actor binding not evident. |
| Database lifecycle | Not ready | PostgreSQL target conflicts with MySQL-specific V1 DDL; default Flyway-off/Hibernate-update configuration can create drift. |
| Functional quality | Not verified | Backend/Maven tests could not run; no disposable database/accounts; login E2E is 0/2. |
| Frontend build | Partial pass | Typecheck and production build pass, but main JS bundle is about 1.194 MB and triggers chunk warning. |
| Integrations | Not verified | SMTP, Redis, WebSocket, LiveKit-compatible, biometric and monitoring runtime paths not exercised. |
| Operations/DR | Not verified | Compose and monitoring files exist; backup/restore, alerting, RPO/RTO, secrets injection and production topology not proven. |
| Mobile | Not assessed / absent in checkout | No native app source discovered. |

## Release blockers

Resolve SEC-001 through SEC-005 before any production employee data: credential hygiene/bootstrap, authenticated tenant binding, sensitive auth route protections, employee/document object and file privacy, and workflow approver enforcement. Resolve DB-001/DB-002 before fresh environment provisioning. Then complete P1 controls and execute the regression plan in [REMEDIATION_ROADMAP.md](REMEDIATION_ROADMAP.md).

## Required evidence before production decision

- Clean secret scan and rotation/revocation record for exposed/default values.
- Successful two-tenant isolation suite covering auth, API, files, reports, background tasks and WebSockets.
- Role/ownership matrix tested at API layer, including negative tests.
- Fresh PostgreSQL migration and upgrade tests using production schema settings.
- Core module end-to-end business signoff for attendance, leave, payroll, requests/approvals and employee lifecycle.
- Backend unit/integration suite and reliable frontend E2E suite green in CI.
- Integration outage/retry/idempotency tests and verified health/monitoring alerts.
- Backup restore rehearsal, recovery objectives, privacy retention and incident runbooks.
- Production TLS, CORS, cookie, logging redaction and secret-injection evidence.

## Limits

This report reflects the current working tree, which already had modified and untracked business source at audit start. No source was changed by the audit. We did not start the backend or database, inspect real employee records, execute exploit tests, or benchmark server performance. “Not verified” must not be interpreted as pass.
