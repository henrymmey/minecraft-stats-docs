# Self-hosting

Use the [complete installation guide](/installation/) for a fresh production deployment.

This section covers the pieces most commonly changed after installation:

- [Domain & HTTPS](/self-hosting/domain)
- [OIDC administrator login](/self-hosting/oidc)
- [Maintenance & backups](/self-hosting/maintenance)

## Production topology

```
Internet
  |
  v
Caddy / HTTPS
  |------> Dashboard static files
  |
  +------> HM Stats Server :8000
                |
                v
            PostgreSQL
```

Keep the application port private and do not expose PostgreSQL to the public internet.

The current dashboard uses same-origin `/api/*` and `/auth/*` requests, so a single public hostname is the simplest supported deployment.

## Server container

The current server Dockerfile runs Laravel with PHP 8.5 and exposes port 8000 inside the deployment.

The startup script runs database migrations before starting the application.

## Development deployment

For local development, the server repository also contains:

```bash
docker compose -f docker/compose.dev.yml up --build
```

That development stack uses HTTP on localhost and should not be copied to production unchanged.
