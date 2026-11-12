# Frontend and UI Audit

## Scope

The frontend is a React 18 single-page application built with Vite 5.4.21, TypeScript and JavaScript. It uses React Router 6, Redux Toolkit, Axios, Tailwind CSS, React Hook Form/Yup, Recharts, jsPDF, xlsx, STOMP/SockJS and a LiveKit client. The current tree contains 23 feature directories and 56 page-named files. No native Android/iOS client source was identified.

## Navigation and state

`frontend/src/App.tsx` composes routed feature pages, shared layouts under `frontend/src/components/layout/`, and API clients under `frontend/src/api/`. Redux slices include authentication and other application state under `frontend/src/store/`. Auth state persists access and refresh token values in browser `localStorage` (`authSlice.ts` / `apiClient.ts`). Route guards improve navigation UX but cannot replace server-side authorization.

## UI surfaces observed

| Surface | Evidence | Status |
|---|---|---|
| Authentication | `modules/auth/pages/LoginPage.jsx`; auth slice and API client. | UI renders, but existing E2E selectors no longer match the current labels/placeholders. |
| Employee directory/profile | `modules/employee` and `modules/profile`. | UI/API paths exist; object-level access safety is a backend concern and remains unresolved. |
| Attendance and policy | Attendance page/API and current-tree `PolicyConfigPage.tsx`. | Attendance/policy paths exist; audit-only end-to-end interaction was not performed. |
| Leave, requests, approvals | Feature pages and corresponding clients. | Screens exist; backend authorization/state defects block workflow acceptance. |
| Payroll, expense, reports | Payroll, claims, reports pages with client-side export libraries. | Calculation accuracy, export correctness and access boundaries are unverified. |
| Recruitment/interviews | ATS, lobby and interview room. | LiveKit signaling/provider readiness and candidate privacy unverified. |
| Other operations | Documents, offboarding, shift, asset, helpdesk, communication, notification, tenant and dashboard pages. | Present in source; behavior not certified by appearance. |

## Executed UI checks

- `npm run type-check`: **PASS**.
- `npm run build -- --outDir ../hrms-audit/frontend-build`: **PASS**, 3,031 modules. The main JS output is approximately 1.194 MB and triggers Vite's chunk-size warning; stale Browserslist database notice was also emitted.
- Existing Playwright login suite: **0/2 PASS**. The current `LoginPage.jsx` uses the `name@company.com` email placeholder, `Enter your account password` password placeholder and `Sign In to Workspace` CTA; `frontend/e2e/login.spec.js` expects the former “Welcome back” heading and old `you@company.com` placeholder. One test failed on the heading assertion; the other timed out on the email selector. Results are in `playwright-test-results/`.

No full module navigation sweep was completed; a backend/database test environment and seed accounts were not available. These UI surfaces must remain **NOT VERIFIED** for functional behavior.

## UI/UX risks and gaps

1. **Automated UI contract drift (UI-001, P2):** selectors do not reflect current login UI, reducing confidence in the existing E2E harness.
2. **Browser token exposure (SEC-007, P1):** refresh credentials are persisted in localStorage, increasing exposure if script injection occurs.
3. **Responsive/accessibility validation:** no systematic screen-size, keyboard, focus, contrast, label, screen-reader or browser-console audit was run; status is **NOT VERIFIED**.
4. **Failure/loading/duplicate-submit behavior:** source review did not establish consistent behavior across all forms; verify network errors, retry, disabled submit and duplicate requests module by module.
5. **Large initial bundle (PERF-001, P2):** build output indicates an oversized main chunk; route-level code splitting and production network performance need measurement.
6. **Frontend authorization:** hidden controls and routes are presentation safeguards only; every API remains subject to independent backend authorization.

## Recommended UI verification matrix

For each route, record role, screen, action, request payload, response, visible result, loading/error behavior, keyboard access and viewport. Prioritize auth, employee documents, leave approvals, attendance policy, payroll exports and tenant administration after P0 fixes. Use synthetic data only. No screenshots of actual employee records were included in this audit.
