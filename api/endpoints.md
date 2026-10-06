# API endpoint reference

This page documents the currently implemented HTTP routes. The machine-readable contract is [OpenAPI v1](https://github.com/henrymmey/minecraft-stats-docs/blob/main/openapi/v1.yaml).

Set your base URL to your HM Stats hostname:

```
https://stats.example.com
```

All endpoint paths below are relative to:

```
/api/v1
```

## Authentication

### API-key routes

Send:

```http
Authorization: Bearer mst_client_<uuid>_<secret>
Accept: application/json
```

The exact token prefix depends on the key type:

```
mst_client_...
mst_website_...
mst_integration_...
```

The key must be active, not expired/revoked, and have the required scope.

### Administrator routes

Admin routes use the browser's OIDC-authenticated session cookie.

Do not send a client/website API key to an admin route.

## Health

### GET /api/v1/health/live

No authentication.

Use it to check that the Laravel process responds.

```bash
curl -i https://stats.example.com/api/v1/health/live
```

Success:

```json
{"status":"ok"}
```

### GET /api/v1/health/ready

No authentication.

Checks database connectivity as well as application availability.

```bash
curl -i https://stats.example.com/api/v1/health/ready
```

Success:

```json
{"status":"ok"}
```

If PostgreSQL cannot be reached, the server returns HTTP 503.

## Ingestion

### POST /api/v1/ingest/batch

Required scope:

```
ingest:write
```

Headers:

```http
Authorization: Bearer mst_client_...
Content-Type: application/json
Accept: application/json
```

Optional:

```http
X-Request-ID: <client-generated-id>
```

Example payload:

```json
{
  "protocol_version": 1,
  "client": {
    "mod_version": "0.1.0",
    "minecraft_version": "26.2",
    "fabric_loader_version": "0.19.3"
  },
  "player": {
    "uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "username": "PlayerOne"
  },
  "server": {
    "hostname": "play.example.net",
    "port": 25565
  },
  "season": null,
  "session_id": "11111111-2222-3333-4444-555555555555",
  "observed_at": "2026-10-06T12:00:00Z",
  "stats": [
    {
      "key": "minecraft:killed:minecraft:zombie",
      "value": 42
    }
  ],
  "events": [
    {
      "id": "66666666-7777-8888-9999-aaaaaaaaaaaa",
      "type": "SESSION_STARTED",
      "occurred_at": "2026-10-06T12:00:00Z",
      "payload": {}
    }
  ]
}
```

Important behavior:

- statistics are **absolute values**, not increments
- the server resolves the workspace from the API key
- player access is checked against UUID restrictions
- the reported hostname + port must match a registered enabled server
- ingestion needs an active season
- the optional `season` field is only a hint; the server remains authoritative
- event IDs are intended to be idempotent across retries

Success:

```json
{
  "accepted": true,
  "request_id": "...",
  "server_time": "2026-10-06T12:00:01Z",
  "next_upload_after": 60
}
```

## Players

### GET /api/v1/players

Required scope: `players:read`

Query parameters:

| Parameter | Required | Meaning |
|---|---:|---|
| `search` | No | Username substring search |
| `page` | No | Page number, starting at 1 |
| `per_page` | No | Page size, 1–100; default 50 |

```bash
curl -H "Authorization: Bearer mst_website_..." \
  "https://stats.example.com/api/v1/players?search=Henry&per_page=50"
```

The API returns public players visible to the key's UUID restrictions.

Example shape:

```json
{
  "data": [
    {
      "id": "...",
      "uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      "username": "PlayerOne",
      "public": true
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

### GET /api/v1/players/{player}

Required scope: `players:read`

`player` is a Minecraft player UUID.

The player must belong to the current workspace, be public and be permitted by UUID restrictions.

## Player statistics

### GET /api/v1/players/{player}/stats

Required scope: `stats:read`

Query:

```
?season=<season-id-or-slug>
```

The season can be its UUID or its slug.

Example:

```bash
curl -H "Authorization: Bearer mst_website_..." \
  "https://stats.example.com/api/v1/players/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/stats?season=craftattack-14"
```

Example response:

```json
{
  "player": {
    "id": "...",
    "uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "username": "PlayerOne",
    "public": true
  },
  "season": {
    "id": "...",
    "name": "CraftAttack 14",
    "slug": "craftattack-14",
    "active": true,
    "started_at": null,
    "ended_at": null
  },
  "stats": [
    {
      "key": "minecraft:killed:minecraft:zombie",
      "value": 42,
      "updated_at": "2026-10-06T12:00:01Z"
    }
  ]
}
```

Only public statistic definitions are returned.

## Leaderboards

### GET /api/v1/leaderboards

Required scope: `leaderboards:read`

Required query parameters:

```
season=<season-id-or-slug>
stat=<public-stat-key>
```

Optional:

```
limit=10
```

The limit is clamped to 1–100.

Example:

```bash
curl -H "Authorization: Bearer mst_website_..." \
  "https://stats.example.com/api/v1/leaderboards?season=craftattack-14&stat=minecraft:killed:minecraft:zombie&limit=10"
```

The response contains the selected season, statistic key and ranked entries.

The player list is also filtered by the API key's UUID restrictions.

## Online players

### GET /api/v1/online

Required scope: `presence:read`

Returns public players that have an open game session with a last heartbeat/seen time within the previous two minutes.

Example:

```bash
curl -H "Authorization: Bearer mst_website_..." \
  "https://stats.example.com/api/v1/online"
```

Response shape:

```json
{
  "data": [
    {
      "player": {
        "id": "...",
        "uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "username": "PlayerOne",
        "public": true
      },
      "online": true,
      "last_seen_at": "2026-10-06T12:00:01Z"
    }
  ]
}
```

## Seasons

### GET /api/v1/seasons

Required scope: `stats:read`

Returns seasons visible to the API key. If the key has season restrictions, only those seasons are returned.

```bash
curl -H "Authorization: Bearer mst_website_..." \
  "https://stats.example.com/api/v1/seasons"
```

## Administrator API

These routes use the OIDC browser session and are mainly used by the dashboard.

### GET /api/v1/admin/me

Returns the currently authenticated OIDC user and workspace context.

### POST /api/v1/setup/bootstrap

Creates the first workspace from a one-time bootstrap token.

Request:

```json
{
  "token": "mst_bootstrap_<uuid>_<secret>"
}
```

Returns HTTP 201 on success.

This endpoint is only usable before the first workspace exists.

### API-key management

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/admin/api-keys` | List keys without raw secrets |
| POST | `/api/v1/admin/api-keys` | Create key; secret returned once |
| PUT | `/api/v1/admin/api-keys/{key}` | Update name, scopes and restrictions |
| POST | `/api/v1/admin/api-keys/{key}/rotate` | Revoke and replace a key |
| POST | `/api/v1/admin/api-keys/{key}/revoke` | Revoke a key |

The current dashboard exposes all key lifecycle actions.

### Servers

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/admin/servers` | List workspace servers |
| POST | `/api/v1/admin/servers` | Register a server |
| PUT | `/api/v1/admin/servers/{server}` | Update a server |

### Seasons

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/admin/seasons` | List seasons |
| POST | `/api/v1/admin/seasons` | Create a season |
| POST | `/api/v1/admin/seasons/{season}/activate` | Activate a season |

### Players

```
GET /api/v1/admin/players
```

Lists workspace players for administration. The endpoint currently returns up to 500 records.

### Users

```
GET /api/v1/admin/users
PUT /api/v1/admin/users/{user}
```

The API supports workspace role management.

### Audit log

```
GET /api/v1/admin/audit-log
```

Returns paginated audit records for the current workspace.

The dashboard's complete audit-log UI is not implemented yet.

## Errors

Common status codes:

| Status | Meaning |
|---:|---|
| 200 | Successful read/update/ingest |
| 201 | Resource/workspace created |
| 204 | Revoke succeeded |
| 400 | Invalid request at HTTP layer |
| 401 | Missing/invalid authentication |
| 403 | Valid identity but insufficient authorization |
| 404 | Resource/server/season not found |
| 409 | Conflict |
| 422 | Validation/semantic error |
| 429 | Rate limited by the deployed API/proxy |
| 503 | Health/readiness failure |

Typical error body:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "The request is not authorized.",
    "request_id": "..."
  }
}
```

Use the `request_id` when investigating a failed request in server logs.

## API-key restrictions and empty lists

For UUID, server and season restrictions, an empty list means unrestricted for that dimension.

Example:

```
UUID restrictions: [player UUID]
Server restrictions: []
Season restrictions: [current season]
```

This key is limited to the selected player and season, but can use any registered enabled server.

Use restrictions deliberately; avoid leaving every dimension empty for client keys.
