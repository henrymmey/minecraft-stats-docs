# Roadmap

## Phase 0 — Foundation

- [x] Create four repositories
- [x] Define architecture
- [x] Define data model
- [x] Define API authentication model
- [x] Define repository responsibilities
- [ ] Add licenses
- [ ] Add contribution/security policies
- [ ] Add CI skeletons

## Phase 1 — Protocol and server MVP

- [ ] Implement PostgreSQL migrations
- [ ] Implement API key creation/revocation/rotation
- [ ] Implement scope authorization
- [ ] Implement UUID/server/season restrictions
- [ ] Implement `POST /api/v1/ingest/batch`
- [ ] Implement idempotency
- [ ] Implement players/seasons/servers
- [ ] Implement stats/session persistence
- [ ] Add health endpoints

## Phase 2 — Client MVP

- [ ] Bootstrap Fabric client
- [ ] Implement configuration
- [ ] Implement server detection
- [ ] Implement statistics collection
- [ ] Implement durable queue
- [ ] Implement batch uploader
- [ ] Implement retries/backoff
- [ ] Implement status/configuration screen

## Phase 3 — Dashboard

- [ ] Bootstrap React application
- [ ] Implement OIDC login flow
- [ ] Implement overview
- [ ] Implement players
- [ ] Implement API keys
- [ ] Implement servers/seasons
- [ ] Implement audit log

## Phase 4 — Public API

- [ ] Finalize OpenAPI schemas
- [ ] Add read-only website integration
- [ ] Add leaderboards
- [ ] Add presence
- [ ] Generate TypeScript client types

## Phase 5 — Production hardening

- [ ] Docker images
- [ ] Compose deployment
- [ ] Caddy/TLS documentation
- [ ] Backups
- [ ] CI/CD
- [ ] Security scanning
- [ ] Rate-limit tuning
- [ ] Observability
- [ ] Release process

## Phase 6 — Advanced analytics

- [ ] Stat history charts
- [ ] Advancement events
- [ ] Activity timeline
- [ ] Retention policies
- [ ] Additional collectors

## 1.0 release criteria

A 1.0 release requires a working end-to-end self-hosted installation, documented API, tested client/server protocol, OIDC admin authentication, secure API keys, database migrations, backups documentation and reproducible Docker deployment.
