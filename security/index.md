# Security

For operators, the main security model is simple: keep the server private, expose only HTTPS, and give every credential the smallest practical scope.

## Client keys

A client API key lives on a player's machine and can therefore be recovered by that player.

For a normal clan client key use:

```
ingest:write
+ player's UUID
+ registered server
+ current season
```

Restrictions are the primary containment mechanism.

## Website and integration keys

Use separate read credentials for trusted server-side integrations.

Never embed these keys in browser JavaScript, public repositories or player configs.

## Administrator accounts

Admin authentication uses OIDC and a server-side session cookie.

Keep the OIDC client secret on the server and use an exact HTTPS callback URL.

## Server secrets

Protect:

- `APP_KEY`
- `DB_PASSWORD`
- `OIDC_CLIENT_SECRET`
- `API_KEY_PEPPER`

Do not commit the deployment `.env` file.

## Key lifecycle

The dashboard supports Create, Edit, Rotate and Revoke.

The raw secret is shown only once during creation/rotation.

## HTTPS and database exposure

Production must use HTTPS.

PostgreSQL should remain on the private Docker network and must not be published publicly.

See [Domain & HTTPS](/self-hosting/domain) and [API Keys](/dashboard/api-keys).
