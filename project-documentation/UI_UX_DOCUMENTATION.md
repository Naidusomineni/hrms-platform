# UI/UX Documentation

## Application shell and navigation

`frontend/src/App.tsx` defines public auth routes, guest interview routes, protected interview routes and the authenticated `MainLayout`. `MainLayout`, `Sidebar` and `Topbar` provide the main navigation shell. `ProtectedRoute.tsx` checks authentication and supports optional role allow-lists. `tenantSlice` loads tenant branding and module state influences navigation where integrated.

## Route inventory

| Route | Screen |
|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | Authentication |
| `/first-login-change-password` | Mandatory first-login change |
| `/interview/guest/:guestToken`, `/interview/guest/:guestToken/room` | Candidate interview access |
| `/recruitment/interview/:sessionId` | Protected interviewer room |
| `/dashboard`, `/approvals`, `/requests`, `/attendance`, `/shifts`, `/intelligence`, `/leaves` | Operational and self-service workspace |
| `/documents`, `/employees`, `/employees/new`, `/employees/:id`, `/employees/:id/edit`, `/departments` | Employee and organization management |
| `/payroll`, `/expenses`, `/notifications`, `/profile` | Compensation and employee experience |
| `/performance`, `/recruitment`, `/assets`, `/helpdesk`, `/announcements`, `/reports`, `/offboarding` | Business modules |
| `/policies`, `/admin` | Restricted policy and administration screens |

## Frontend structure and patterns

- `src/modules/<module>/pages` contains feature screens; `services` often wraps module API calls.
- `src/api` contains API clients and module endpoints; `src/shared/services/apiClient.js` and `src/api/apiClient.ts` are shared client surfaces.
- Redux Toolkit store is in `src/store`; `authSlice`, `tenantSlice` and `uiSlice` are visible slices.
- TypeScript domain contracts live in `src/types`; codebase mixes `.tsx/.ts` and `.jsx/.js`.
- Tailwind CSS and shared components provide styling; Recharts is used for charting; jsPDF utilities create downloadable documents.
- Error boundary and common components exist under `src/components/common` and `src/shared/components`.

## UX behavior evidenced by code

The app refreshes tenant branding on startup and attempts access-token refresh when a refresh token is found in local storage. Authenticated employees default to `/profile`; users requiring a password change are sent to the change page; others default to `/dashboard`. Candidate guest routes are intentionally accessible without the normal authenticated shell. A fallback 404 screen exists.

## Accessibility and responsive behavior

Tailwind-based responsive styling is present, but no verified accessibility audit, keyboard-navigation coverage, contrast validation, localization strategy, or formal design system specification was found. Confirm these with product/design owners. The UI includes profile-photo cropper and generated PDF utilities.

