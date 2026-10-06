# Platform Architecture

## Product model

HM Stats is a self-hostable multi-workspace platform.

A workspace is an independent dataset and security boundary. HMT is one possible workspace, not a hardcoded special case.

## Components

```
Fabric Client
    |
    | HTTPS / Bearer client API key
    v
Laravel API
    |
    +--> PostgreSQL
    |
    +--> OIDC provider (admin authentication)
    ^
    |
React Dashboard
    |
    +--> secure browser session

External website
    |
    +--> read-only website API key
    v
Laravel read API
```

## Core principles

### Client is untrusted

The client can be modified by the person running Minecraft.

Therefore the server decides:

- workspace
- allowed player UUIDs
- allowed servers
- allowed seasons
- scopes
- rate limits
- protocol compatibility

### Website is read-oriented

A normal website integration receives read scopes only.

### Admins are OIDC users

No application-owned password database is required.

### Database is internal

Websites and dashboards never connect directly to PostgreSQL.

### API is versioned

All stable external routes live under `/api/v1`.

## Deployment

Production deployment uses Docker, PostgreSQL and an HTTPS reverse proxy.

## Versioning

- Minecraft compatibility: per client release
- Client protocol: explicit protocol version
- HTTP API: major version in URL
- Server/dashboard: semantic versioning
