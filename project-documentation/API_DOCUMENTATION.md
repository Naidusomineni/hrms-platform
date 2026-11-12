# API Documentation

## Conventions

Controller mappings use `/v1` paths. The default `application.properties` sets `server.servlet.context-path=/api`, so deployed/local default paths are `/api/v1/...`; a different active profile or deployment override may change this. Endpoints generally wrap JSON results in `ApiResponse<T>`. Standard request bodies use Jakarta validation where annotated. Pagination uses Spring `Page<T>` on selected list operations. Upload routes consume `multipart/form-data`; document download returns a resource. Authentication is usually `Authorization: Bearer <access-token>`. Tenant context can be supplied with `X-Tenant-ID`; details are in the security document. Exact response fields should be taken from each DTO, not inferred from route names.

The API inventory below reflects controller mappings. Authorization can additionally come from `SecurityConfig`, class/method `@PreAuthorize`, or service checks; missing annotations do not mean public access because most paths require authentication.

### Common payloads confirmed in source

`ApiResponse<T>` serializes non-null fields `success` (boolean), `message`, `data`, `timestamp`, `requestId`, and `statusCode`. Success factory methods populate `success/message/data`; error response shape/status is controlled by `GlobalExceptionHandler` and can omit null members.

`POST /v1/auth/login` accepts `LoginRequest`: `email` (required email), `password` (required), `rememberMe` (Boolean, default false), and optional `totpCode` (Integer). Its `AuthResponse` includes `accessToken`, `refreshToken`, `tokenType` (default `Bearer`), `tenantId`, `userId`, `employeeId`, `email`, `fullName`, `role`, `emailVerified`, `profilePicture`, `expiresIn`, `totpEnabled`, and `mustChangePassword`. The controller also sets the refresh cookie.

`POST /v1/attendance/punch` accepts `AttendancePunchRequest`: required `employeeId`, `date`, `time`, `punchType`; optional `latitude`, `longitude`, `ipAddress`, `officeLocationId`, `selfieUrl`, `remarks`, `lateArrivalReason`, `punchSource`, `deviceId`, and `workMode`. The response data type is `AttendanceResponse`.

`POST /v1/workflows/tasks/{instanceId}/decision` accepts `ApprovalActionRequest` with required `decision` and optional `comments`, and returns `WorkflowTaskResponse`. Although the DTO comment lists `REQUEST_CHANGE`, `WorkflowEngineService.processApproval` currently accepts only `APPROVED` and `REJECTED` and throws for other values.

`POST /v1/requests` uses `EmployeeRequestCreateDto`: required `employeeId`, `requestType`, `title`, optional `description`, `startDate`, `endDate`, `amount`, and `attachmentUrl`. The accepted request types and constraints should be confirmed in `EmployeeRequestService`; the DTO comment lists WORK_FROM_HOME, SHIFT_CHANGE, EXPENSE_CLAIM, TRAVEL_REQUEST, and BONAFIDE_LETTER.

Example envelope (illustrative field values only):

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "timestamp": "<server-local-date-time>",
  "requestId": "<request-id>",
  "statusCode": 200
}
```

The sample is a shape illustration; timestamps and optional properties depend on runtime serialization and request filters.

## Endpoint inventory

| Area | Method and path | Purpose / request shape |
|---|---|---|
| Auth | `POST /v1/auth/register` | `RegisterRequest`; returns `AuthResponse` |
| Auth | `POST /v1/auth/login` | `LoginRequest`; returns access/refresh data and sets refresh cookie |
| Auth | `POST /v1/auth/refresh` | refresh token in body or cookie; rotates token |
| Auth | `POST /v1/auth/logout`, `/logout-all` | Revoke token or request session invalidation; logout-all controller is currently a success stub |
| Auth | `POST /v1/auth/forgot-password`, `/reset-password` | OTP reset requests |
| Auth | `POST /v1/auth/verify-email`, `/resend-verification` | Query parameters `token/email` or `email` |
| Auth | `POST /v1/auth/change-password` | `ChangePasswordRequest` |
| Auth | `GET /v1/auth/login-history?userId=…` | Login history query |
| Auth | `POST /v1/auth/2fa/setup`, `/2fa/enable`, `/2fa/disable` | TOTP setup/verification; see controller DTOs |
| Employees | `GET /v1/employees`, `/me`, `/{id}`, `/department/{deptId}` | Employee lists/detail/profile; list endpoints accept pagination/filter parameters in controller |
| Employees | `POST /v1/employees`, `PUT /{id}`, `DELETE /{id}` | Create/update/soft-delete using `EmployeeRequest` |
| Employees | `POST /v1/employees/photo`, `/{id}/photo`, `/{id}/document` | Multipart upload |
| Departments | `GET /v1/departments`, `/{id}`; `POST /`, `PUT /{id}`, `DELETE /{id}` | Department CRUD with `DepartmentRequest` |
| Attendance | `POST /v1/attendance/punch`, `/auto-login-punch`, `/break-toggle` | Punch or toggle break; request DTO/employee ID per controller |
| Attendance | `GET /v1/attendance/today-status`, `/employee/{id}`, `/employee/{id}/monthly`, `/date` | Attendance status/list queries |
| Attendance | `POST /v1/attendance`, `PUT /{id}` | Administrative/manual record create/update |
| Attendance | `POST /biometric-sync`, `/biometric/simulate-punch`, `/biometric-upload` | Ingest JSON punches or CSV multipart; upload path is not proof of vendor connectivity |
| Attendance | `GET/POST /biometric-devices`, `/office-locations` | Device/location management |
| Attendance | `POST /regularize`, `PUT /regularize/{id}/review` | Request/review regularization |
| Policies | `GET /v1/policies/attendance`, `/attendance/{id}`, `/attendance/effective/{employeeId}` | List/detail/effective attendance policy |
| Policies | `POST/PUT/DELETE /v1/policies/attendance[/{id}]`; `GET/POST /assignments`; `DELETE /assignments/{id}` | Policy definition and assignment management |
| Leave | `POST /v1/leaves/apply/{empId}`, `PUT /{id}/review`, `PUT /{id}/cancel/{empId}` | Apply, review, cancel leave |
| Leave | `GET /v1/leaves/employee/{empId}`, `/pending`, `/policies`, `/balances/employee/{empId}` | Leave, policy and balance queries |
| Leave | `POST /v1/leaves/policies`, `/accrual/run` | Configure policy and trigger accrual |
| Requests | `POST /v1/requests`, `GET /employee/{empId}`, `/pending`, `PUT /{id}/review` | Employee request lifecycle |
| Workflows | `GET /v1/workflows/inbox`, `/definitions`, `/delegations`; `POST /tasks/{instanceId}/decision`, `/delegations`; `DELETE /delegations/{id}` | Workflow inbox, decisions, definitions and delegations |
| Payroll | `POST /v1/payroll/process`, `/process-all`, `/{id}/approve`, `/approve-all`, `/mark-paid` | Payroll processing/review lifecycle |
| Payroll | `GET /register`, `/summary`, `/bank-batch-export`, `/bank-batch`, `/employee/{empId}`, `/employee/{empId}/slip`; `PUT /{id}/adjust` | Payroll register, summary, exports and employee slips |
| Recruitment | `GET/POST /v1/recruitment/jobs`, `/candidates`; `PATCH /candidates/{id}/stage` | Job and candidate management |
| Recruitment | `POST/GET /candidates/{id}/scorecards`; `POST /candidates/{id}/convert-to-employee` | Candidate evaluation/conversion |
| Interviews | `POST/GET /v1/recruitment/interviews`, `GET /candidate/{candidateId}`, `/{id}`, `/{id}/join-token` | Session lifecycle and join token |
| Interviews | `GET /guest/{guestToken}`, `POST /guest/{guestToken}/join`, `/telemetry`, `/signal`; `GET /guest/{guestToken}/signals` | Guest access/signaling endpoints |
| Interviews | `PUT /{id}/scorecard`; `GET/POST /{id}/panelists`; `DELETE /{id}/panelists/{panelistId}`; `POST /{id}/complete`, `/cancel`, `/signal`; `GET /{id}/signals`; `GET /{id}/scorecards` | Interview evaluation, panel and signaling |
| Performance | `GET/POST /v1/performance/cycles`; `GET/POST /goals/employee/{empId}`, `/goals`; `PATCH /goals/{id}/progress`; `GET /reviews`, `/reviews/employee/{empId}`; `POST /reviews` | Cycles, goals and reviews |
| Expenses | `POST /v1/expenses/claims`; `GET /claims/my`, `/claims`, `/claims/{id}`; `PUT /claims/{id}/manager-review`, `/finance-review` | Expense submission, queries and staged review |
| Documents | `POST /v1/documents/upload`; `GET /employee/{empId}`, `/pending-verification`, `/{id}/download`; `PUT /{id}/verify`; `POST /{id}/acknowledge`, `/letters/generate` | Upload, verification, download, acknowledgement and letter generation |
| Offboarding | `POST/GET /v1/offboarding/separations`, `GET /separations/{id}`, `/separations/my`; `PUT /separations/{id}/review`, `/clearances/{id}`; `POST /settlements/calculate`, `/settlements`; `GET /settlements/separation/{separationId}` | Separation, clearances and settlement |
| Shifts | `GET/POST /v1/shifts`; `POST /roster/assign`; `GET /roster`, `/roster/my`; `POST /swaps`; incoming/outgoing/pending-manager swap GETs; peer and manager review PUTs | Shift, roster and swap lifecycle |
| Assets | `GET/POST /v1/assets`; `POST /{id}/allocate`, `/allocations/{id}/return`; `GET /employee/{empId}` | Asset inventory and allocations |
| Helpdesk | `POST/GET /v1/helpdesk/tickets`, `/tickets/my`, `/{id}`, `/stats`; `PUT /tickets/{id}`; `POST /tickets/{id}/comments` | Ticket creation, review, comments, stats |
| Communication | `POST/GET /v1/communication/announcements`, `GET /announcements/all`, `POST /announcements/{id}/acknowledge`, `DELETE /announcements/{id}` | Announcement lifecycle |
| Notifications | `GET /v1/notifications/user/{userId}`, `/unread-count`; `PUT /user/{userId}/mark-all-read`, `/{id}/read` | Notification queries/read markers |
| Intelligence | `POST /v1/intelligence/assistant/ask`; policy GET/POST/upload/PUT/DELETE paths; risk-analysis, re-evaluate and department-overview; `POST /ats/evaluate-candidate` | Assistant/policy/risk/candidate matching APIs |
| Reports/dashboard | `GET /v1/reports/analytics`, `/tax/employee/{empId}`; `POST /tax`; `GET /v1/dashboard/admin` | Analytics, declarations and dashboard |
| Admin | `GET /v1/admin/users`, `/audit`, `/settings`; `PATCH /users/{id}/status`, `/users/{id}/role`; `PUT /settings/{key}` | User, audit and system settings |
| Tenants | `GET /v1/tenants`, `/current`, `/{id}`, `/{id}/settings`; `POST /`; `PUT /{id}/settings/{key}`, `/current/branding`, `/{id}/branding`; logo multipart POST paths | Tenant management and branding |
| Tenant modules | `GET /v1/tenant/modules`, `/enabled`; `PUT /{moduleKey}`, `/batch` | Manifest reads/toggle/batch update |

## Response and error handling

Most endpoints return `ApiResponse` with success/message/data fields (verify `ApiResponse.java` for exact null/error conventions). Exceptions are mapped by `GlobalExceptionHandler`; likely domain categories include bad request, not found, duplicate resource and token refresh errors. Do not assume one status code for every endpoint without checking handler mappings.

## Interactive reference

SpringDoc/OpenAPI dependencies and Swagger paths are configured in `application.properties` and `SecurityConfig`. Run the backend and inspect the configured `/swagger-ui` and `/v3/api-docs` paths for generated request schemas. Runtime availability depends on active profile and security configuration.

