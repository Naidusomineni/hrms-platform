# Missing Features and Product Gap Analysis

## Assessment method

This is a code-evidence gap assessment, not a claim that every enterprise HRMS requires each feature. “Missing” means no supporting implementation was found in the inspected repository; deployments may provide capabilities externally. “Not verified” means a source surface exists but actual business operation was not tested. Do not treat optional enhancements as defects.

## Implemented surface versus verified workflow

The repository includes source for identity, employee records, departments, attendance/policy, leave, requests/workflows, payroll, expenses, recruitment/interviews, performance, documents, offboarding, shift, assets, helpdesk, communication, notifications, dashboards/reports, workforce intelligence and tenant administration. Except for frontend typecheck/build and login E2E, modules were not executed end-to-end. Presence does not establish business completeness or correctness.

## Product gaps and confirmation needs

| Area | Repository evidence | Gap classification | Business impact / next step |
|---|---|---|---|
| Native mobile | No Android/iOS/Flutter/React Native source discovered. | Missing from this repository; **confirm** whether a mobile app is in another repo or out of scope. | No basis to claim native mobile security or feature parity. |
| Payroll provider/bank interface | Payroll processing/export UI exists; no external bank or payroll-provider client identified. | Missing integration in inspected code; manual file workflow may exist. | Confirm required jurisdictions, provider, reconciliation, authorization and audit needs. |
| Biometric vendor integration | JSON/CSV ingestion and device metadata exist; no vendor SDK or authenticated device connector found. | Partial ingestion surface; live device integration unverified. | Confirm device types, trust model, replay protection and field mapping. |
| SSO / enterprise identity | JWT/password/TOTP paths exist; no SAML/OIDC IdP integration was found. | Not found in code; **confirm** required identity provider. | Enterprise onboarding may require centralized lifecycle and MFA policy. |
| Private object storage | Local filesystem adapters found; no S3/object-store adapter. | Missing from inspected implementation. | Confirm storage scale, encryption, lifecycle, backup, residency and private delivery. |
| Tenant boundary | Tenant entities/context exist, but manual filtering and request-asserted context present. | Implemented concept with critical gaps (SEC-002, SEC-010). | Must be fixed and tested before multi-tenant production use. |
| Workflow authority and governance | Workflow definitions, steps, instances and delegation code exist. | Partial/unsafe implementation (SEC-005, WF-001); SLA/escalation behavior not evidenced as complete. | Confirm approval matrix, delegation rules, audit history, escalation and rollback semantics. |
| Audit trail | Login history and domain activity surfaces exist in places. | No comprehensive immutable privileged-action trail evidenced. | Confirm retention, access, export, actor/tenant binding and tamper resistance requirements. |
| HR lifecycle completeness | Employee, recruitment and offboarding surfaces exist. | HR events, document retention, legal and settlement semantics not verified. | HR/legal owners must validate lifecycle transitions and jurisdiction-specific requirements. |
| Payroll/statutory accuracy | Payroll and tax/report surfaces exist. | Calculation and jurisdiction logic not independently validated. | Payroll owner/accountant signoff and golden test vectors required before use. |
| Resilience/operations | Docker, monitoring config and local logs exist. | Backup/restore, DR, alerting, operational SLOs and runbooks not verified. | Operations owner to define RPO/RTO and deployment controls. |
| Accessibility/localization | React UI and responsive styling exist. | No formal WCAG or locale/currency/date coverage audit executed. | Confirm language, accessibility and regional requirements; execute conformance review. |
| Data export/privacy governance | Client PDF/spreadsheet packages and report screens exist. | Export correctness, redaction, retention and auditability not verified. | Confirm data controller policy and export approval requirements. |

## Suggested acceptance gates before rollout

1. Close all P0 findings and prove tenant/object/file authorization with negative tests.
2. Resolve schema migration and choose a production schema-management strategy.
3. Validate payroll/leave/attendance rules with business-approved examples and jurisdiction scope.
4. Confirm required SSO, mobile, biometric, storage and payroll integrations.
5. Complete end-to-end tests for every discovered role and module using synthetic data.
6. Establish audit retention, backup/restore, monitoring, incident response and support ownership.

## Unresolved product questions

- Is this deployment intended for one organization or multiple independent tenants?
- Which countries, currencies, payroll rules, retention schedules and leave policies are in scope?
- Are mobile clients, SSO, biometric hardware, banks/payroll providers or object storage managed in separate systems/repos?
- What approval matrix, delegation and escalation rules should be supported?
- What audit events, retention period, backup objective and availability target are contractually required?

These questions require product/operations confirmation; no corresponding capabilities are assumed here.
