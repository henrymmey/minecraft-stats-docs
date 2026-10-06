# Installation

This is the main guide for a clan or community administrator starting from a fresh Linux server.

The reference deployment uses Docker for the HM Stats Server and PostgreSQL, Caddy for HTTPS, and a static build of the React dashboard.

> **Current repository state:** a production Docker Compose file is not shipped by the server repository yet. The compose file in this guide is a reference production configuration based on the current server Dockerfile and entrypoint.

## Architecture

```
Internet
   |
   | HTTPS :443
   v
Caddy
   |   | \
   |  +--> /api/* and /auth/* --> HM Stats Server :8000
   |
   +-------> Dashboard static files
                    |
                    v
               HM Stats Server
                    |
                    v
               PostgreSQL
```

Use **one hostname** for the dashboard and API. The current dashboard calls `/api/*` and `/auth/*` relative to its own origin and relies on the server session cookie.

For the examples below, use:

```
stats.example.com
```

Replace it with your real hostname everywhere.

## Requirements

A Linux host with:

- Docker Engine
- Docker Compose v2
- Git
- Node.js 22 + npm
- Caddy
- OpenSSL

The HM Stats Server can run entirely in Docker; PHP does not need to be installed on the host.

## 1. Create the deployment directory

```bash
sudo mkdir -p /opt/hm-stats
sudo chown "$USER":"$USER" /opt/hm-stats
cd /opt/hm-stats
```

Clone the server and dashboard repositories:

```bash
git clone https://github.com/henrymmey/minecraft-stats-server.git
git clone https://github.com/henrymmey/minecraft-stats-dashboard.git
```

## 2. Configure DNS

At your DNS provider, point the hostname to the public IP of the Linux host.

IPv4:

```
A     stats.example.com     <PUBLIC_IPV4>
```

IPv6, when used:

```
AAAA  stats.example.com     <PUBLIC_IPV6>
```

Open inbound TCP ports **80** and **443**.

Do not publish PostgreSQL port 5432 to the internet.

## 3. Create the production environment

Create `/opt/hm-stats/.env`:

```dotenv
APP_NAME="HM Stats"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://stats.example.com

LOG_CHANNEL=stack
LOG_LEVEL=info

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=hm_stats
DB_USERNAME=hm_stats
DB_PASSWORD=CHANGE_ME

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

OIDC_ISSUER=https://your-oidc-provider.example/...
OIDC_CLIENT_ID=CHANGE_ME
OIDC_CLIENT_SECRET=CHANGE_ME
OIDC_REDIRECT_URI=https://stats.example.com/auth/callback
OIDC_REQUIRE_HTTPS=true

API_KEY_PEPPER=CHANGE_ME
```

Generate strong random values:

```bash
openssl rand -hex 32
```

Use one value for `DB_PASSWORD` and another independent value for `API_KEY_PEPPER`.

Protect the file:

```bash
chmod 600 /opt/hm-stats/.env
```

Never commit this file.

## 4. Create the Docker Compose file

Create `/opt/hm-stats/docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: ./minecraft-stats-server
    env_file:
      - ./.env
    restart: unless-stopped
    ports:
      - "127.0.0.1:8000:8000"
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:18.6
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_DATABASE}"]
      interval: 5s
      timeout: 5s
      retries: 20

volumes:
  postgres_data:
```

The server is bound to localhost only. Caddy will be the public entry point.

## 5. Generate APP_KEY and build the server

Build the application image:

```bash
cd /opt/hm-stats
docker compose build app
```

Generate a Laravel key without writing a host file:

```bash
docker compose run --rm --no-deps app php artisan key:generate --show
```

Copy the returned `base64:...` value into:

```dotenv
APP_KEY=base64:...
```

Also fill in the real database and OIDC values in `.env`.

## 6. Start PostgreSQL and the server

```bash
cd /opt/hm-stats
docker compose up -d
docker compose ps
```

The current server container automatically executes:

```bash
php artisan migrate --force
```

before starting Laravel on port 8000.

Check the database-backed health endpoint:

```bash
curl -i http://127.0.0.1:8000/api/v1/health/ready
```

Expected result:

```json
{"status":"ok"}
```

For startup errors:

```bash
docker compose logs -f app
docker compose logs -f postgres
```

## 7. Build the dashboard

The dashboard is a static React application and currently uses Node.js 22 in CI.

```bash
cd /opt/hm-stats/minecraft-stats-dashboard
npm ci
npm run build
```

Install the build into a stable web directory:

```bash
sudo rm -rf /srv/hm-stats-dashboard
sudo mkdir -p /srv/hm-stats-dashboard
sudo cp -a dist/. /srv/hm-stats-dashboard/
```

No dashboard API URL needs to be configured because the frontend uses relative paths on the same hostname.

## 8. Configure Caddy

Create `/etc/caddy/Caddyfile`:

```caddy
stats.example.com {
    encode gzip

    handle /api/* {
        reverse_proxy 127.0.0.1:8000
    }

    handle /auth/* {
        reverse_proxy 127.0.0.1:8000
    }

    root * /srv/hm-stats-dashboard
    try_files {path} /index.html
    file_server
}
```

Validate and reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy can obtain and renew the TLS certificate automatically when the DNS record is correct and TCP 80/443 are reachable.

Test:

```bash
curl -I https://stats.example.com/
curl -i https://stats.example.com/api/v1/health/live
```

## 9. Configure your OIDC provider

HM Stats does not use a local dashboard password. Administrators authenticate through OpenID Connect.

Create a confidential web client/application at your OIDC provider.

Set the exact redirect URI:

```
https://stats.example.com/auth/callback
```

The server requests the standard scopes:

```
openid profile email
```

The provider should supply:

- `sub`
- `name` or `preferred_username`
- optionally `email`
- optionally `picture`

Put the provider values into `/opt/hm-stats/.env`:

```dotenv
OIDC_ISSUER=https://your-provider.example/...
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
OIDC_REDIRECT_URI=https://stats.example.com/auth/callback
OIDC_REQUIRE_HTTPS=true
```

Recreate the app after changing the environment:

```bash
cd /opt/hm-stats
docker compose up -d --force-recreate app
```

Continue with the [OIDC guide](/self-hosting/oidc) when your provider needs additional setup.

## 10. Log in and bootstrap the first workspace

Create the one-time bootstrap token on the server:

```bash
cd /opt/hm-stats
docker compose exec app php artisan stats:bootstrap-token "My Clan" my-clan --ttl=60
```

The command prints a token similar to:

```
mst_bootstrap_<uuid>_<secret>
```

Copy it immediately. It is shown once and expires after the requested TTL. The default is 60 minutes.

Open:

```
https://stats.example.com/auth/login
```

Complete the OIDC login.

Then open:

```
https://stats.example.com/setup
```

Paste the token and select **Initialize workspace**.

Your OIDC account becomes the initial workspace owner.

The bootstrap flow is only available before the first workspace exists and a token can only be consumed once.

## 11. Register the Minecraft server

In the dashboard, open **Servers** and register the actual Minecraft endpoint.

Example:

| Field | Example |
|---|---|
| Name | `craftattack` |
| Display name | `CraftAttack` |
| Hostname | `play.example.net` |
| Port | `25565` |

The hostname and port must match what the HM Stats client reports.

The server must be enabled before ingestion is accepted.

## 12. Create the season

Open **Seasons**.

Example:

| Field | Example |
|---|---|
| Name | `CraftAttack 14` |
| Slug | `craftattack-14` |
| Activate immediately | enabled |

Only one season is active at a time. Creating a new active season or activating another season deactivates the others in the workspace.

## 13. Create a client API key

Open **API Keys** and create a **Client** key.

Recommended settings for one player:

```
Scope
  ingest:write

UUID restriction
  <player's Minecraft UUID>

Server restriction
  <registered server>

Season restriction
  <current season>
```

The raw secret is shown only once. Save it immediately.

The resulting token has the form:

```
mst_client_<uuid>_<secret>
```

Never paste this key into a public issue, Discord channel or Git repository.

## 14. Install the client

Every participating player installs the Fabric mod locally.

Requirements:

- Minecraft 26.2
- Java 25
- Fabric Loader 0.19.3 or newer
- Fabric API compatible with Minecraft 26.2
- HM Stats client JAR

The current repository uploads the built JAR as a GitHub Actions artifact named `hm-stats-client`. There is currently no Modrinth or CurseForge publication configured.

See [Client configuration](/client/configuration).

## 15. Configure the client

The file is:

```
.minecraft/config/hm-stats.json
```

Example:

```json
{
  "enabled": true,
  "api": {
    "url": "https://stats.example.com",
    "key": "mst_client_<uuid>_<secret>"
  },
  "upload": {
    "intervalSeconds": 60,
    "batchSize": 100,
    "maxQueueSize": 5000
  },
  "servers": {
    "allow": [
      "play.example.net:25565"
    ]
  },
  "privacy": {
    "sendStatistics": true,
    "sendAdvancements": true,
    "sendEvents": true
  }
}
```

Close Minecraft before editing the file, then start it again.

## 16. Verify the complete pipeline

A working installation should pass these checks in order:

1. `/api/v1/health/ready` returns HTTP 200.
2. OIDC login succeeds.
3. A workspace exists.
4. A server is registered and enabled.
5. A season is active.
6. A client key exists with correct restrictions.
7. The player's client points to the HTTPS URL.
8. The player joins the registered Minecraft server.
9. The player appears in **Players**.
10. The client key's **Last used** time changes.

For read API verification, create a separate website/integration key and use the [API endpoint reference](/api/endpoints).

## 17. Back up PostgreSQL

Run a database dump regularly:

```bash
cd /opt/hm-stats
docker compose exec -T postgres pg_dump -U "$DB_USERNAME" -d "$DB_DATABASE" > hm-stats-backup.sql
```

Store backups outside the server as well.

A restore into an existing database can be done with:

```bash
cat hm-stats-backup.sql | docker compose exec -T postgres psql -U "$DB_USERNAME" -d "$DB_DATABASE"
```

Test backups periodically instead of assuming they are usable.

## 18. Update the installation

Back up the database first.

Update the server:

```bash
cd /opt/hm-stats/minecraft-stats-server
git pull

cd /opt/hm-stats
docker compose build app
docker compose up -d
```

Migrations are run by the current server startup script.

Update the dashboard:

```bash
cd /opt/hm-stats/minecraft-stats-dashboard
git pull
npm ci
npm run build

sudo rm -rf /srv/hm-stats-dashboard
sudo mkdir -p /srv/hm-stats-dashboard
sudo cp -a dist/. /srv/hm-stats-dashboard/
sudo systemctl reload caddy
```

Keep `/opt/hm-stats/.env` outside Git and do not overwrite it with repository files.

## Production checklist

- [ ] DNS is correct
- [ ] HTTPS works
- [ ] TCP 80/443 are reachable
- [ ] PostgreSQL is not public
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` is set
- [ ] `API_KEY_PEPPER` is set
- [ ] OIDC callback URI exactly matches
- [ ] dashboard and API use the same hostname
- [ ] first workspace was bootstrapped
- [ ] Minecraft server is registered and enabled
- [ ] a season is active
- [ ] client keys use the smallest practical restrictions
- [ ] a PostgreSQL backup exists and has been tested
