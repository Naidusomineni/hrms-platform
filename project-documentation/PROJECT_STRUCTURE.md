# Project Structure

## Repository root

| Path | Responsibility |
|---|---|
| `backend/` | Spring Boot service, Maven build, Java source and resources |
| `frontend/` | React/Vite SPA, package lock, UI source, Playwright configuration/tests |
| `infra/` | Nginx and monitoring configuration |
| `docs/` | Existing schema, technical notes, diagrams, screenshots and presentation artifacts |
| `scripts/` | E2E, diagram/document generation and test utilities |
| `.github/workflows/` | CI/CD workflow definitions |
| `storage/`, `logs/` | Runtime-oriented storage/log paths in working tree; confirm ignored/tracked status before deployment |
| `docker-compose.yml` | Local/container service composition |
| `.env.example` | Environment variable names/template; contains no values copied into this package |
| `README.md` | Existing project guide (claims may be aspirational or stale; source code takes precedence) |
| `hrms_db_seed.sql` | Seed data/schema-related SQL artifact; not a migration substitute |
| `project-documentation/` | This source-grounded documentation package |

## Backend source

| Path | Responsibility |
|---|---|
| `backend/src/main/java/com/hrms/modules/<module>/controller` | REST controllers and route mappings |
| `.../service` | Business logic and orchestration |
| `.../repository` | Spring Data JPA repository interfaces |
| `.../entity` | Persistent domain entities |
| `.../dto` | Transport/request/response contracts |
| `com/hrms/entity`, `repository`, `dto` | Shared/core domain classes |
| `com/hrms/config` | Spring security, CORS, filters, async, WebSocket, rate limits, initialization |
| `com/hrms/security` | JWT and user-details integration |
| `com/hrms/infrastructure` | Tenant context, Redis blacklist and local storage adapters |
| `com/hrms/common` | Shared audit and mail services |
| `backend/src/main/resources/db/migration` | Flyway SQL migrations V1–V15 |
| `backend/src/main/resources/templates/email` | Thymeleaf email templates |
| `backend/src/test` | JUnit/Spring test code and test profiles |

## Frontend source

| Path | Responsibility |
|---|---|
| `frontend/src/App.tsx` | Route composition and startup effects |
| `src/modules/<module>/pages` | Feature screens |
| `src/modules/<module>/services` | Feature-level API/service wrappers |
| `src/api` | API clients and endpoint helpers |
| `src/shared/services` | Shared API service client |
| `src/store` | Redux Toolkit store, slices and hooks |
| `src/components/layout`, `src/shared/layout` | Application shell components; note parallel/legacy-looking paths |
| `src/components/common`, `src/shared/components` | Shared widgets and error boundary |
| `src/types` | Frontend domain/API type definitions |
| `src/styles` | Global styles and Tailwind integration |
| `frontend/e2e`, `playwright.config.js` | Browser E2E test setup |

## Notable implementation observation

There are parallel `components/layout` and `shared/layout` directories and both TS/TSX and JS/JSX files. Confirm which duplicate-looking components are actively used before refactoring; this documentation task made no source changes.

