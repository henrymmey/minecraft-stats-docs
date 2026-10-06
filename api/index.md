# API

The REST API is versioned under `/api/v1`.

For example:

```
https://stats.example.com/api/v1
```

## Authentication

Client, website and integration requests use a Bearer API key:

```http
Authorization: Bearer mst_<type>_<id>_<secret>
```

Administrator endpoints use the OIDC-authenticated browser session instead.

## Useful first checks

```bash
curl -i https://stats.example.com/api/v1/health/live
curl -i https://stats.example.com/api/v1/health/ready
```

## Documentation

- [Complete endpoint reference](/api/endpoints)
- [OpenAPI v1](https://github.com/henrymmey/minecraft-stats-docs/blob/main/openapi/v1.yaml)

The endpoint reference includes scopes, query parameters, payloads, response examples, restrictions and error codes.

## Main endpoint groups

```
Health
  GET  /health/live
  GET  /health/ready

Ingest
  POST /ingest/batch

Read
  GET /players
  GET /players/{player}
  GET /players/{player}/stats
  GET /leaderboards
  GET /online
  GET /seasons

Admin
  GET/POST/PUT /admin/...
  POST /setup/bootstrap
```

API keys should be created specifically for the integration that uses them rather than shared across unrelated systems.
