# Server

The HM Stats Server is the Laravel backend for the platform.

## Runtime

The current repository uses:

- PHP 8.5 in the Docker image
- Laravel 13
- PostgreSQL 18.6
- Docker / Docker Compose

## Responsibilities

The server handles:

- OIDC administrator authentication
- workspace isolation
- API-key authentication and authorization
- player/server/season data
- statistic ingestion and history
- session/event persistence
- audit logging
- the REST API under `/api/v1`

## Production

For a new deployment, follow [Installation](/installation/).

For ongoing operation, use [Maintenance & backups](/self-hosting/maintenance).

For HTTP details, see the [API endpoint reference](/api/endpoints).

## Health endpoints

```
GET /api/v1/health/live
GET /api/v1/health/ready
```

`health/live` checks that the process responds. `health/ready` also checks PostgreSQL and returns HTTP 503 when the database is unavailable.
