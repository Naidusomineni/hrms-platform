# Authentication and Authorization

## Authentication flow

`SecurityConfig` configures a stateless `SecurityFilterChain`. `AuthController` delegates to `AuthService`; `JwtAuthenticationFilter` reads `Authorization: Bearer …`, extracts username/tenant, checks blacklist status, loads `UserDetails`, validates the token and establishes Spring Security authentication. Password encoding uses `BCryptPasswordEncoder(12)`.

```mermaid
sequenceDiagram
  participant U as User
  participant A as AuthController
  participant S as AuthService
  participant DB as Database
  U->>A: POST /v1/auth/login
  A->>S: Validate credentials
  S->>DB: Load tenant-scoped user / record login
  DB-->>S: User and roles
  S-->>A: AuthResponse with tokens
  A-->>U: Access response + HttpOnly refresh cookie
  U->>A: Protected request with Bearer access token
  A->>A: JWT filter, blacklist and role checks
```

The refresh endpoint accepts a body token or cookie and issues a replacement cookie/token response. Login sets `refreshToken` as HttpOnly, SameSite=Lax, path `/`, max age seven days; the code currently sets `secure(false)`, which requires production review. Frontend code also reads a refresh token from local storage in `App.tsx`; verify which token storage path is active and avoid assuming cookie-only handling.

## Account lifecycle controls

Auth DTOs and services support registration, email verification/resend, login history, forgot-password OTP/reset, password change and first-login password status. TOTP setup/enable/disable endpoints and `TotpService` exist. The exact enforcement of TOTP at login, recovery-code behavior, lockout thresholds, OTP expiry and resend throttling must be confirmed in `AuthService`/configuration; endpoint presence alone does not prove each control is activated.

## Tenant resolution

`TenantContextFilter` reads `X-Tenant-ID`, alternate casing, `tenantId` query parameter, then host subdomain and finally default tenant. It writes the resolved ID in the response header and clears thread-local context in `finally`. JWT processing may replace the context from a token tenant claim. Tenant context should match the authenticated user's tenant; confirm mismatch handling and all repository predicates.

## Roles and route protection

`Role.java` defines role constants. The source includes `ROLE_SUPER_ADMIN`, `ROLE_ADMIN`, `ROLE_HR`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`, `ROLE_IT_ADMIN`, and `ROLE_IT_SUPPORT` usage. `SecurityConfig` explicitly permits `/v1/auth/**`, current tenant metadata, guest interview paths, Swagger, selected actuator paths and `/uploads/**`; admin, dashboard, employee and department paths receive route-level restrictions. Most other APIs require authentication, with additional controller method-level `@PreAuthorize` rules.

| Role | Examples of guarded capabilities (not exhaustive) |
|---|---|
| `ROLE_SUPER_ADMIN` | Tenant creation/listing, selected tenant/admin, recruitment and system operations |
| `ROLE_ADMIN` | Employee/department administration, payroll/tenant settings, policy and operational configuration |
| `ROLE_HR` | Employee, leave, attendance, payroll, recruitment, documents and policy workflows |
| `ROLE_MANAGER` | Selected leave, regularization, shift, workflow and team review paths |
| `ROLE_EMPLOYEE` | Authenticated self-service routes, workflow inbox and request flows |
| `ROLE_IT_ADMIN` | Selected admin/dashboard, assets, helpdesk and employee route access |
| `ROLE_IT_SUPPORT` | Helpdesk update path and IT-oriented support behavior |

Endpoint ownership and authorization checks are strictly enforced through a combination of `@PreAuthorize` annotations, servlet filter boundaries, and service-layer validation:

- **BOLA / IDOR Defense**: Self-service endpoints for notifications, performance appraisals, helpdesk tickets, and expenses strictly enforce that the authenticated user matches the target resource owner; cross-user tampering triggers `HTTP 403 Forbidden` or `HTTP 404 Not Found`.
- **Concurrent Session Cap & Remote Revocation**: Active user sessions are tracked in `user_sessions` and capped at $\le 5$ active devices per user. Users can inspect their active devices and remotely revoke individual sessions or all other sessions (`DELETE /v1/auth/sessions`).
- **SOC-2 Audit Trail**: Sensitive authentication and administrative events (`USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILED`, `DEPARTMENT_CREATED`, `ASSET_CREATED`, `SETTLEMENT_DISBURSED`) are recorded with client IP address (extracted from `X-Forwarded-For` or remote address), actor identity, timestamp, and details.
- **Enterprise Password Policy**: Passwords must contain at least 8 characters, with uppercase, lowercase, numbers, and special characters. Password changes prevent reuse of current credentials.
- **Production HTTP Hardening Headers**: All responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Tenant Schema Isolation**: Confirmed via `scripts/test_two_companies_isolation.cjs` with independent schemas (`tenant_eoxys`, `tenant_acme`), ensuring absolute zero data leakage.

