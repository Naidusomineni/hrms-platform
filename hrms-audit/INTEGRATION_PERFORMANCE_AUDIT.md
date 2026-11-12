# Integration and Performance Audit

## Integrations found

| Integration | Evidence in source/config | Verification status and risk |
|---|---|---|
| PostgreSQL | PostgreSQL driver and Compose service. | Not connected during audit. V1 migration syntax needs reconciliation before schema creation. |
| Redis | Redis client and token blacklist adapter. | Runtime connectivity, outage fallback and revocation guarantees not tested. |
| SMTP | Spring Mail configuration and Thymeleaf email templates. | Delivery, TLS, retries, bounce handling and credential provisioning not tested. |
| Local filesystem | Employee upload path and document `StorageService`. | Employee-served uploads have privacy concern; capacity, permissions, backup and cleanup not tested. No S3/object-store adapter identified. |
| WebSocket/STOMP | Notification/interview signaling configuration and frontend SockJS/STOMP client. | Wildcard origin patterns; authentication and topic/subscription authorization not verified. |
| LiveKit-compatible interview token | Token/signaling service and frontend LiveKit client. | No provider connectivity or room lifecycle tested; do not infer an active vendor account. |
| Biometric ingestion | Attendance JSON/CSV ingestion and device metadata code. | No device vendor SDK or authenticated external device connector established. Device identity/signature and replay protection need verification. |
| Prometheus/Grafana | Actuator/Micrometer configuration and monitoring provisioning. | Scrape, dashboards, access protection, alerting and production metrics not verified. |
| Client exports | jsPDF and xlsx frontend packages. | Export data accuracy, formula injection, access and large-file handling not tested. |

No external bank, tax authority, SSO, object storage or external AI provider integration was identified in inspected source. This finding is bounded by repository search and does not rule out infrastructure outside the checkout.

## Performance evidence

There was no backend load test, query benchmark or production telemetry available. Do not interpret this audit as a performance benchmark.

| Finding | Evidence | Consequence to investigate |
|---|---|---|
| PERF-001 — frontend bundle size (P2) | Successful Vite build reports main JS bundle approximately 1.194 MB and chunk-size warning. | Slower first load on constrained devices; measure route chunking and transfer size. |
| WF-001 — workflow inbox amplification (P2) | `WorkflowEngineService.getPendingTasksForUser(User)` ignores the supplied user, returns tenant pending work without pagination and maps with per-row reads. | Excessive data disclosure, query count growth and payload size as workflow volume increases. Security impact also covered by SEC-005. |
| PERF-002 — unbounded page parameters (P2) | Some controller methods pass raw `page`/`size` into `PageRequest.of`. | Expensive reads or invalid request failures; enforce caps and validate bounds consistently. |
| SEC-012 — login IP bucket retention (P2) | In-memory `ConcurrentHashMap` rate buckets are not cleaned up; client address trusts forwarded header. | Memory growth and spoofable rate limits; see SEC-012. |

## Resilience and operational checks not completed

No integration outage/retry test was run. Retry policy, timeouts, circuit breaking, idempotency, dead-letter behavior, synchronization reconciliation and redacted integration logs must be verified for SMTP, Redis, WebSocket/LiveKit and file storage. External connection credentials were not tested or copied into these documents.

## Recommended performance test sequence

After security/schema blockers are fixed, use synthetic data in a disposable deployment: baseline API p50/p95/p99 and error rate; profile representative dashboard, employee search, attendance, workflow inbox and reports; inspect SQL count and plans; test large paginated exports; test concurrent approval/payroll updates; run a constrained-browser frontend load; and repeat with Redis/SMTP/provider failure injection. Record environment, dataset, thresholds and actual results before making any capacity claim.
