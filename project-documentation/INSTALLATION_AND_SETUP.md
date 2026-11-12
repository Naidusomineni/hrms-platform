# Installation and Setup

## Prerequisites

- Java 21 (project README and compiler configuration target Java 21)
- Maven 3.9+ (wrapper availability is not established in the repository inventory)
- Node.js/npm compatible with the frontend lockfile and Vite toolchain
- PostgreSQL version supported by the chosen application profile (Compose provisions PostgreSQL 16)
- Optional Redis for token blacklist behavior
- Docker and Docker Compose for the containerized path

## Configuration

Use `.env.example` as the variable-name reference. Do not commit real credentials. Backend configuration is in `backend/src/main/resources/application*.properties`; active profile determines datasource, JWT, mail, upload, CORS, rate limit and actuator settings. Secret values are intentionally excluded from this document. Verify required environment variable names and defaults in properties/Compose before deployment.

## Local backend

1. Provision PostgreSQL and create an application database/user.
2. Configure environment values for datasource, JWT secret, mail, upload location and optional Redis.
3. From `backend`, build and run with Maven, selecting the intended Spring profile.
4. Confirm Flyway migration logs and health endpoint before using the API.

The repository includes `setup-postgres.bat`; inspect it before running because it is an environment-specific helper. Review migration V1 for PostgreSQL compatibility before first migration.

## Local frontend

1. From `frontend`, run `npm ci` using the committed lockfile.
2. Set the API base URL and any tenant configuration expected by `vite.config.js` / `.env` files.
3. Run the Vite development server with the package script.
4. Open the served URL and sign in with an account provisioned for the selected tenant.

No default credentials are reproduced here. Review `DataInitializer` and seed SQL for development-only account setup, and change/remove any seeded credentials before use outside a disposable local environment.

## Docker Compose

The root `docker-compose.yml` declares PostgreSQL, Redis, backend, frontend, Prometheus and Grafana, with named volumes for database, Redis, uploads, logs and Prometheus data. Use environment overrides from a secure local file and check service health before testing the UI. Ports and credentials are defined in configuration files; verify locally rather than copying values into documentation.

## Profiles and checks

Backend profile files include `application.properties`, `application-pg17.properties`, `application-h2.properties`, plus `src/test/resources/application-test.properties`. Confirm the intended profile; H2 tests do not prove PostgreSQL migration compatibility. OpenAPI paths are configured through SpringDoc.

