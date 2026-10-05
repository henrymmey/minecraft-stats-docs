# API

The HTTP API is versioned under `/api/v1`.

Authentication for client and integration requests:

```
Authorization: Bearer <API_KEY>
```

The normative OpenAPI document is available here:

[OpenAPI v1](https://github.com/henrymmey/minecraft-stats-docs/blob/main/openapi/v1.yaml)

## Client ingestion

```
POST /api/v1/ingest/batch
```

The request contains absolute statistics and idempotent event IDs.

## Read API

```
GET /api/v1/players
GET /api/v1/players/{player}
GET /api/v1/players/{player}/stats
GET /api/v1/leaderboards
GET /api/v1/online
GET /api/v1/seasons
```
