# Deployment and Maintenance

## Deployment assets

The repository contains Dockerfiles for backend/frontend, root `docker-compose.yml`, frontend `vercel.json`, frontend and infrastructure Nginx configurations, GitHub Actions workflow files under `.github/workflows`, and Prometheus/Grafana configuration under `infra/monitoring`. Compose provisions PostgreSQL, Redis, API, frontend, Prometheus and Grafana.

## Deployment outline

1. Build backend and frontend artifacts using locked dependency versions.
2. Provision PostgreSQL and Redis with persistent volumes and restricted network access.
3. Supply secrets through the hosting platform's secret manager; do not rely on checked-in defaults.
4. Configure datasource, JWT signing key, mail, CORS, frontend API URL, tenant host routing, upload volume and monitoring endpoints.
5. Deploy API and frontend behind TLS-terminating ingress/proxy; ensure refresh cookies use secure production attributes.
6. Review and apply Flyway migrations with a tested backup/restore plan; validate V1 SQL dialect compatibility.
7. Verify health/readiness, login, tenant resolution, file persistence, mail and monitoring after rollout.

The steps describe deployment dependencies, not a verified production runbook. No specific cloud platform or release approval procedure can be confirmed solely from repository artifacts.

## Monitoring and maintenance

- Spring Actuator health/info and Micrometer Prometheus registry are configured.
- `infra/monitoring/prometheus.yml` configures scraping; Grafana datasource provisioning exists.
- Logging configuration writes application logs; Compose has a logs volume.
- Review retention and access to application logs, uploaded documents, monitoring dashboards and audit data.
- Maintain PostgreSQL and Redis backups, restore drills, disk/volume monitoring, TLS certificate rotation, dependency updates and security incident procedures.
- Keep Flyway migration state synchronized across environments; do not edit already-applied migrations.

## Operational risks requiring confirmation

- Local storage must be persistent/shared if multiple backend instances serve uploaded files.
- Redis availability/fallback behavior affects revocation semantics.
- Rate limiting is described in code/config, but distributed enforcement across replicas is not established.
- CI workflow artifacts and status snippets in repository are not proof of current release status.
- Validate health endpoint exposure and whether actuator detail/metrics are adequately restricted.
- Establish backups, recovery time/objectives, supported upgrade window, data retention and tenant offboarding procedure with operations.

