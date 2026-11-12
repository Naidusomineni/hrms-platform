# HRMS Project Documentation

This documentation describes the implementation present in this repository at review time. Source code and the latest database migrations take precedence over older design documents and README feature claims. Items marked **partially implemented** or **verify** need operational or product confirmation.

## Documents

1. [Project overview](PROJECT_OVERVIEW.md)
2. [Software requirements specification](SOFTWARE_REQUIREMENTS_SPECIFICATION.md)
3. [System architecture](SYSTEM_ARCHITECTURE.md)
4. [Module wise documentation](MODULE_WISE_DOCUMENTATION.md)
5. [Database design](DATABASE_DESIGN.md)
6. [API documentation](API_DOCUMENTATION.md)
7. [Authentication and authorization](AUTHENTICATION_AND_AUTHORIZATION.md)
8. [User workflows](USER_WORKFLOWS.md)
9. [UI/UX documentation](UI_UX_DOCUMENTATION.md)
10. [Installation and setup](INSTALLATION_AND_SETUP.md)
11. [Testing documentation](TESTING_DOCUMENTATION.md)
12. [Deployment and maintenance](DEPLOYMENT_AND_MAINTENANCE.md)
13. [Project structure](PROJECT_STRUCTURE.md)

## Evidence and scope

Primary evidence: `backend/src/main/java`, `backend/src/main/resources/db/migration`, `backend/src/test`, `frontend/src`, `frontend/package.json`, `docker-compose.yml`, Dockerfiles, CI workflow files and `.env.example`. No application source or existing documentation was changed to create this package. Secret values are intentionally omitted. Repository state contained pre-existing uncommitted changes; this package describes the working tree as inspected.

## Known review items

- Migration `V1__fix_payroll_columns.sql` uses MySQL-style `DROP INDEX` and `MODIFY COLUMN`, while runtime configuration and later migrations are PostgreSQL-oriented. Confirm the migration history that has actually been applied and whether V1 is compatible with the target database.
- Several controller routes identify records using supplied numeric IDs. Authorization annotations are not uniformly present on self-service endpoints; verify tenant and ownership enforcement in service methods before production exposure.
- `AuthController.logoutAll` currently returns success without revoking sessions in its controller implementation.
- The configured refresh cookie sets `secure(false)` in `AuthController`; confirm production cookie handling at the deployment boundary.
- Some modules have entities and UI/API surfaces but no repository migration in the visible migration directory, including recruitment/job posting data and tax declarations; reconcile these with the supplied SQL schema and deployed database.

