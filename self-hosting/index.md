# Self-hosting

The recommended deployment uses Docker Compose.

Target services:

```
Caddy
  ├── Laravel API
  ├── React Dashboard
  └── PostgreSQL
```

Production secrets belong in environment variables or Docker Secrets.

## First setup

1. Deploy the containers.
2. Configure the database.
3. Configure OIDC.
4. Create a one-time bootstrap token with `php artisan stats:bootstrap-token`.
5. Log in through OIDC.
6. Consume the bootstrap token to become the initial workspace owner.
7. Create a client API key.
8. Register the Minecraft server and season.
9. Give the client key the smallest possible player/server/season restrictions.

Do not expose PostgreSQL directly to the public internet.
