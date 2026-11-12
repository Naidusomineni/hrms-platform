# Role and Permission Audit

## Role sources

`backend/src/main/java/com/hrms/enums/Role.java` defines `ROLE_SUPER_ADMIN`, `ROLE_ADMIN`, `ROLE_HR`, `ROLE_MANAGER`, `ROLE_EMPLOYEE` and `ROLE_IT_ADMIN`. `UserDetailsServiceImpl` also loads tenant-role names and permission names from `TenantRole` associations. Helpdesk guards mention `ROLE_IT_SUPPORT`, which is not in the enum; confirm whether that authority is intentionally created as a dynamic tenant role.

`SecurityConfig` supplies path-level rules; `@PreAuthorize` on controllers supplies method-level rules; `ProtectedRoute` controls only frontend navigation. These three layers are not identical. The frontend guard is never an authorization boundary.

## Observed access matrix (not a complete approved permission policy)

| Capability | Super Admin | Admin | HR | Manager | Employee | IT Admin / Support |
|---|---:|---:|---:|---:|---:|---:|
| Admin audit/users route family | Yes | Yes | No | No | No | IT Admin yes |
| General `/v1/admin/**` | Yes | Yes | No | No | No | No by path rule |
| Dashboard API | No explicit in path rule | Yes | Yes | No | No | IT Admin yes |
| Employee collection and writes | No explicit path grant unless method/path rules | Yes | Yes | No | No | IT Admin path grant; method guards may be narrower |
| Single employee GET `/employees/{id}` | Authenticated, not owner-bound | Yes | Yes | Yes | Yes | Yes |
| Department route family | Path rule allows Admin/HR/IT Admin; method guards can narrow it | Yes | Yes | Generally no | No | Potential method-rule conflict |
| Attendance | Controller methods vary | Yes | Yes | Selected review paths | Selected self-service paths | No general grant |
| Leave | Selected manager/HR/admin operations | Yes | Yes | Selected | Submit/query surface | No general grant |
| Workflow decision | Controller permits Admin/HR/Manager | Yes | Yes | Yes | No | No |
| Payroll | Admin/HR; selected Super Admin paths | Yes | Yes | No | Limited employee slip routes require review | No |
| Expense review | Controller uses `hasAnyRole` for Admin/HR/Manager groups | Yes | Yes | Manager review | Submit/self-service | No |
| Helpdesk | Controller-specific role list | Yes | Yes | Yes | Create/list behaviors vary | IT Admin/IT Support strings appear |
| Document upload/download/ack | Authenticated defaults for several methods | Yes | Yes | Yes | Yes | Yes unless separately restricted |
| Tenant module toggles | Super/Admin controller rules vary; tenant module endpoint Admin | Yes | Limited/read varies | Some read paths | Some read paths | No |

The table summarizes observed code, not a business-approved matrix. It does not certify row-level/team visibility, tenant scope, or service-level checks.

## Role-specific audit results

### Employee

- UI routes are gated by `ProtectedRoute` and the role value in browser state.
- Backend `GET /api/v1/employees/{id}`, request list, document list/download and several create/acknowledge operations accept caller-supplied numeric identifiers with no consistent principal/owner check.
- Employees may reach broad workflow inbox data because `getPendingTasksForUser(User)` ignores its user parameter.
- Browser tokens and user metadata are persisted in localStorage.
- **Status:** `PARTIALLY WORKING`; self-service confidentiality and tenant binding are release blockers.

### Manager

- Manager authority appears in leave, workflow, attendance, shift, expense and intelligence guards.
- Team hierarchy/reporting relationships are not consistently applied in services; a manager-level role often authorizes the whole operation without checking team membership or configured step assignment.
- Global DELETE rule may prevent actions that method annotations otherwise allow, including delegation/policy deletion.
- **Status:** `NOT VERIFIED`.

### HR

- HR has broad employee, attendance, leave, payroll, recruiting, documents and workflow access.
- Method-level guards may narrow some route-level access; endpoints whose path is public or merely authenticated can bypass HR-only intent if no method guard exists.
- **Status:** `NOT VERIFIED`.

### Admin / Super Admin

- Admin/Super Admin route controls exist, but seeded administrative accounts and credential defaults are present in source/config.
- Admin paths use hard-coded role names, while tenant permissions are loaded as authorities; no complete evidence shows permission names are consistently checked by endpoints.
- **Status:** `NOT VERIFIED`; bootstrap credentials are P0.

### IT Admin / IT Support

- `ROLE_IT_ADMIN` is an enum role and has selected route access for admin, dashboard, employee/department and asset/helpdesk paths.
- `ROLE_IT_SUPPORT` appears in helpdesk guards but not in the enum. Dynamic `TenantRole` strings may supply it; creation/assignment lifecycle and exact authority spelling are not confirmed.
- **Status:** `NOT VERIFIED`.

## Confirmed policy gaps and mismatches

1. **No complete permission matrix:** route and method guards vary by endpoint; route inventory is in `APPLICATION_INVENTORY.md`.
2. **Frontend/backend role mismatch risk:** `ProtectedRoute` hides pages but does not prevent direct API requests.
3. **Method/path inconsistency:** `SecurityConfig` restricts all DELETE `/v1/**` to Super Admin/Admin even where a controller method allows HR/Manager (for example delegation or policy operations). Conversely, some read-by-ID paths allow any authenticated role.
4. **Role is not row-level scope:** manager role does not automatically prove team ownership; employee role does not prove ownership of supplied employee IDs.
5. **Dynamic permissions unclear:** tenant permissions are added to authorities, but endpoint guards mostly use fixed role strings. Confirm whether permission names have any effective endpoint enforcement.
6. **Auth route public exception:** `/v1/auth/**` permit-all includes sensitive user-specific operations with no effective method-level guard.

## Required role regression tests

For every controller method, test each enum/dynamic authority and no-token request; then repeat with a same-tenant non-owner, other-team manager, other-tenant identity, and changed numeric ID. Include successful and denied list/detail/download/update/delete/approve/export flows. Verify the server response, not just navigation visibility. No comprehensive role matrix test currently exists in the visible test suite.
