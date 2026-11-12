# Multi-tenant Security Audit

## Architecture observed

- `TenantContextFilter` reads `X-Tenant-ID`, alternate-case header, `tenantId` query parameter, then Host subdomain, with a default tenant fallback. It clears the ThreadLocal in `finally`.
- `JwtUtils.generateToken` adds the current `TenantContext` as the JWT `tenant_id` claim.
- `JwtAuthenticationFilter` restores that claim into `TenantContext` on authenticated requests.
- `BaseTenantEntity` adds a non-null, non-updatable `tenant_id` column and fills it on insert if absent.
- Many repositories offer `findByTenantId...` methods. There is no global JPA/Hibernate filter or database row-level security visible in the reviewed source; tenant safety depends on each caller using the scoped method.
- Tenant, tenant role, subscription, settings and manifest entities/services support tenant administration and feature toggles.

## Critical issue: tenant selection is not bound to identity

During public login, the tenant filter accepts caller-provided context. `AuthService.login` authenticates by email and reloads user globally. `JwtUtils.generateToken(UserDetails)` embeds the current context as `tenant_id`, and the authenticated request filter then trusts that token claim. No equality check between `User.tenantId` and selected tenant was found in that flow.

**Impact:** an authenticated user can potentially obtain a JWT whose tenant context differs from the tenant of the user record. Any query path that scopes only by `TenantContext` then risks cross-tenant reads or writes. This is P0 and must be fixed before data is loaded.

**Safe verification plan:** on an isolated two-tenant database, create a low-privilege account in tenant A and synthetic records in tenant B. Attempt login with tenant-B header using tenant-A credentials, decode only the test token's tenant claim, then attempt a read against tenant B. Expected: login rejects mismatched context and no B-scoped token is issued. This test was **not executed** due to lack of a disposable backend/database environment.

## Data access and isolation review

### Positive controls

- `TenantContextFilter` clears context in a `finally` block.
- Several operational repositories explicitly filter by tenant ID, including employee, department, payroll, workflow pending list, policy, expense, communication and report paths.
- `LocalStorageService.downloadFile/deleteFile` normalize paths and check that resolved paths remain under the current tenant directory.

### Gaps requiring remediation

1. `BaseTenantEntity` is not a read filter. `JpaRepository.findById`, `findAll` and ID-based relation loads remain global unless wrapped by tenant-aware access.
2. `EmployeeService.getById`, `DocumentService` ID operations, `EmployeeRequestService` create/review/get, `WorkflowEngineService.processApproval`, `PolicyResolverService` policy/target retrieval and multiple other modules use ID-only lookups.
3. `EmployeeRequestService.createRequest` accepts `employeeId` from the body and does not bind it to the authenticated principal.
4. `WorkflowEngineService.processApproval` uses workflow instance ID without tenant constraint and does not compare configured approver identity/role.
5. `PolicyResolverService.assignPolicy` loads policy, employee, department and office location by ID, then saves an assignment under current tenant. It does not visibly check that each related record belongs to the same tenant.
6. `AuthService.register` runs in client-selected tenant context; `User`/`Employee` inherit or explicitly use that context. Tenant membership/existence checks need confirmation.
7. Authenticated API client sends `X-Tenant-ID` from localStorage; frontend-controlled tenant ID is routing context and must never grant authority.
8. `TenantModuleController` feature-manifest toggles control navigation/availability and cannot substitute for endpoint authorization.
9. Background schedulers and data initializer require explicit per-tenant loops/scopes; no tenant isolation test covers them.
10. Upload path layout has per-tenant local folders, but employee resume URLs map to a public `/uploads/**` resource path. Filesystem partitioning does not protect public static URLs.

## Required tenant regression suite

For each tenant-owned entity and endpoint:

1. Create two tenants with same logical user roles and synthetic data.
2. Verify unauthenticated and authenticated tenant-header changes cannot switch the JWT identity's tenant.
3. Attempt read/write/update/delete/approve/download using an ID belonging to the other tenant.
4. Test foreign IDs in DTO associations: employee, department, policy, location, reviewer, delegatee, workflow, document, asset, shift and payroll.
5. Test duplicate natural keys across tenants and within one tenant.
6. Test scheduler jobs, reports, exports, notifications, uploads and WebSocket subscriptions under both tenant contexts.
7. Assert tenant IDs are set on inserts, immutable after persistence and consistent on all relations.
8. Run concurrency tests for tenant-scoped workflow, attendance, leave balance and payroll updates.

## Target architecture controls (roadmap only)

- Establish tenant identity from authenticated membership and a trusted tenant routing mechanism; compare token, user membership and request tenant at every boundary.
- Add a tenant-aware repository/service abstraction or persistence-level filtering; disallow unscoped repository calls for tenant-owned entities.
- Use tenant+ID lookups for all external identifiers and validate every relation before mutation.
- Consider PostgreSQL row-level security as defense-in-depth only after migration, connection-pool context and background-job semantics are designed and tested.
- Isolate tenant file access behind authorization-aware downloads; use private object storage in production.
- Add two-tenant negative tests to each module and require them in CI.

## Readiness

**Tenant isolation: FAIL / P0 unresolved.** Current source includes tenant-aware design elements but the login claim construction and ID-only service lookups prevent a production assurance claim. No tenant-pair tests were run.
