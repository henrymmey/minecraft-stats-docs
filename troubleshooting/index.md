# Troubleshooting

Start with the layer that is failing: DNS/TLS, Laravel/PostgreSQL, OIDC, dashboard session, API key authorization, or Minecraft client.

## 1. Is the server alive?

Run:

```bash
curl -i https://stats.example.com/api/v1/health/live
```

Expected:

```
HTTP/2 200
```

with:

```json
{"status":"ok"}
```

If this fails, check DNS, Caddy and the server container.

## 2. Is PostgreSQL ready?

Run:

```bash
curl -i https://stats.example.com/api/v1/health/ready
```

HTTP 503 means the application cannot confirm database readiness.

Check:

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f postgres
```

## 3. Dashboard keeps redirecting to login

This normally means the browser does not have a valid HM Stats session.

Check:

- OIDC is configured
- the callback URI is exact
- `APP_URL` uses the public HTTPS hostname
- Caddy forwards `/auth/*` to Laravel
- dashboard and API use the same hostname

The expected callback is:

```
https://stats.example.com/auth/callback
```

## 4. Bootstrap does not work

Generate a new token:

```bash
docker compose exec app php artisan stats:bootstrap-token "My Clan" my-clan --ttl=60
```

A bootstrap token is only usable before the first workspace exists and is single-use.

Common causes of HTTP 422:

- token copied incorrectly
- token expired
- token already consumed
- workspace already exists

## 5. Player does not appear

A player is normally created after a successful ingest.

Check the client configuration and then inspect the key:

**Dashboard → API Keys → Last used**

If the timestamp never changes, the request is not successfully authenticating.

Then verify:

- player UUID restriction
- server restriction
- registered server hostname/port
- server enabled state
- active season
- `ingest:write` scope

## 6. 401 INVALID_API_KEY

Authentication failed.

Rotate the key in the dashboard and replace the token in the player's `hm-stats.json`.

Do not try to "fix" a 401 by giving the key unrelated read scopes.

## 7. 403 FORBIDDEN

The key is valid, but the request is outside its authorization.

For client ingestion, check UUID, server and season restrictions.

For read APIs, check the required scope.

## 8. 404 NOT_FOUND during ingest

The server may not be registered or the workspace may not have an active season.

Check:

**Servers** and **Seasons** in the dashboard.

## 9. Dashboard builds but routes show 404 after refresh

The web server must serve the SPA fallback:

```
try_files {path} /index.html
```

See the [Caddy configuration](/self-hosting/domain).

## 10. HTTPS certificate problems

Check:

```bash
dig +short stats.example.com
sudo caddy validate --config /etc/caddy/Caddyfile
sudo journalctl -u caddy --no-pager -n 100
```

Make sure ports 80 and 443 reach the server.

## 11. API errors and request IDs

API errors contain a `request_id`.

Example:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "...",
    "request_id": "..."
  }
}
```

Keep the request ID when contacting an administrator or investigating logs.

## 12. Never publish secrets while debugging

Before attaching logs or screenshots, remove:

- API keys
- Authorization headers
- OIDC client secrets
- session cookies
- the deployment `.env`
