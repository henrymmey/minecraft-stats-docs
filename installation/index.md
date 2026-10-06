# Complete installation guide

This guide takes you from an empty Linux server to a working HM Stats installation with:

- HM Stats Server
- PostgreSQL
- HM Stats Dashboard
- Caddy / automatic HTTPS
- OIDC administrator login
- a workspace
- a Minecraft server registration
- a season
- a restricted client API key
- a configured Minecraft 26.2 client

The production stack is defined by the `docker-compose.yml` and `Caddyfile` in this documentation repository. The Compose file builds the current server and dashboard repositories locally, so the installation does not depend on a pre-published application image.

> **Recommended:** use a dedicated VPS or server with a normal Linux distribution such as Ubuntu or Debian. Do not expose PostgreSQL directly to the internet.

For all examples, replace:

```
stats.example.com
```

with your real HM Stats hostname.

---

## 1. Architecture

```
Internet
   |
   | HTTPS :443
   v
Caddy
   |--------------------> HM Stats Dashboard
   |
   +---- /api/* --------> HM Stats Server :8000
   |
   +---- /auth/* -------> HM Stats Server :8000
                              |
                              v
                         PostgreSQL
```

The Minecraft player installs the HM Stats mod **on their own client**:

```
Minecraft client
     |
     | HTTPS + client API key
     v
HM Stats Server
```

The Minecraft server itself does not need the HM Stats mod.

---

## 2. Requirements

### Server requirements

You need:

- Linux
- Docker Engine
- Docker Compose v2
- Git
- OpenSSL

The supplied Compose stack contains Caddy, so you do not need a host-level web server.

### Minecraft client requirements

The current client targets:

- **Minecraft 26.2**
- **Java 25**
- **Fabric Loader 0.19.3 or newer**
- Fabric API compatible with Minecraft 26.2
- HM Stats client JAR

---

## 3. Install Docker and Git

On Ubuntu/Debian, install Docker using Docker's official installation instructions, then verify:

```bash
docker --version
docker compose version
git --version
openssl version
```

The exact Docker installation differs by Linux distribution. The important requirement is that `docker compose` works without using the old standalone `docker-compose` command.

---

## 4. Clone the three repositories

Create a deployment directory:

```bash
sudo mkdir -p /opt/hm-stats
sudo chown "$USER":"$USER" /opt/hm-stats
cd /opt/hm-stats
```

Clone:

```bash
git clone https://github.com/henrymmey/minecraft-stats-docs.git
git clone https://github.com/henrymmey/minecraft-stats-server.git
git clone https://github.com/henrymmey/minecraft-stats-dashboard.git
```

Your directory should now look like:

```
/opt/hm-stats/
├── minecraft-stats-docs/
├── minecraft-stats-server/
└── minecraft-stats-dashboard/
```

The Compose file expects exactly these sibling directories.

---

## 5. Configure DNS

Choose the public hostname users will use for HM Stats.

Example:

```
stats.example.com
```

At your DNS provider create an A record:

```
A     stats.example.com     <YOUR_SERVER_IPV4>
```

When you have working IPv6, also add:

```
AAAA  stats.example.com     <YOUR_SERVER_IPV6>
```

Check the result:

```bash
dig +short stats.example.com
```

It must resolve to the server that will run Caddy.

### Firewall

Allow inbound:

- TCP 80
- TCP 443

Do **not** allow PostgreSQL TCP 5432 from the public internet.

The supplied Compose stack does not publish PostgreSQL to the host.

---

## 6. Create the deployment files

Use the production Compose and Caddy files from the docs repository:

```bash
cd /opt/hm-stats
cp minecraft-stats-docs/docker-compose.yml .
cp minecraft-stats-docs/Caddyfile .
cp minecraft-stats-docs/.env.example .env
```

You now have:

```
/opt/hm-stats/
├── .env
├── docker-compose.yml
├── Caddyfile
├── minecraft-stats-docs/
├── minecraft-stats-server/
└── minecraft-stats-dashboard/
```

Protect the environment file:

```bash
chmod 600 /opt/hm-stats/.env
```

---

## 7. Configure .env

Edit:

```
/opt/hm-stats/.env
```

Minimal production configuration:

```dotenv
APP_DOMAIN=stats.example.com
APP_URL=https://stats.example.com

APP_KEY=

POSTGRES_DB=hm_stats
POSTGRES_USER=hm_stats
POSTGRES_PASSWORD=CHANGE_ME

API_KEY_PEPPER=CHANGE_ME_TOO

OIDC_ISSUER=https://your-oidc-provider.example/...
OIDC_CLIENT_ID=hm-stats
OIDC_CLIENT_SECRET=CHANGE_ME
OIDC_REDIRECT_URI=https://stats.example.com/auth/callback
```

### Generate strong secrets

Generate separate random values:

```bash
openssl rand -base64 32
openssl rand -hex 32
```

Use one value as `POSTGRES_PASSWORD` and another as `API_KEY_PEPPER`.

Do not reuse either value for an unrelated secret.

### APP_KEY

The Laravel `APP_KEY` is required.

After the first image build you can generate it with:

```bash
docker compose run --rm --no-deps api php artisan key:generate --show
```

Copy the returned value into:

```dotenv
APP_KEY=base64:...
```

Do not regenerate it on every restart. Keep the same `APP_KEY` for the lifetime of the installation.

### OIDC

The exact values depend on your OIDC provider. See [OIDC setup](/self-hosting/oidc).

---

## 8. Configure the public hostname in Caddy

Open:

```
/opt/hm-stats/Caddyfile
```

It should contain your hostname, for example:

```caddy
stats.example.com {
    handle /api/* {
        reverse_proxy api:8000
    }

    handle /auth/* {
        reverse_proxy api:8000
    }

    handle {
        reverse_proxy dashboard:80
    }
}
```

The routing is important:

- `/api/*` → Laravel API
- `/auth/*` → OIDC login/callback/logout
- everything else → React dashboard

You do not need to configure TLS certificates manually. Caddy requests and renews them automatically.

---

## 9. Build and start HM Stats

From the deployment directory:

```bash
cd /opt/hm-stats
docker compose up -d --build
```

The first build may take longer because both the server and dashboard images are built locally.

Check:

```bash
docker compose ps
```

You should have four services:

```
api
dashboard
postgres
caddy
```

### Server startup

The HM Stats Server container automatically runs:

```bash
php artisan migrate --force
```

before starting Laravel on port 8000.

PostgreSQL stays on the internal Docker network.

---

## 10. Test the installation

First test through localhost:

```bash
curl -i http://127.0.0.1:8000/api/v1/health/live
curl -i http://127.0.0.1:8000/api/v1/health/ready
```

Then test the public domain:

```bash
curl -i https://stats.example.com/api/v1/health/live
curl -i https://stats.example.com/api/v1/health/ready
```

Expected successful response:

```json
{"status":"ok"}
```

`health/ready` also checks PostgreSQL. HTTP 503 means the application cannot currently confirm database readiness.

For problems:

```bash
docker compose logs -f api
docker compose logs -f postgres
docker compose logs -f caddy
```

---

## 11. Configure OIDC administrator login

HM Stats administrators authenticate through OpenID Connect.

There is no local HM Stats dashboard password.

At your OIDC provider, create a confidential web application/client.

Use this exact redirect URI:

```
https://stats.example.com/auth/callback
```

HM Stats requests:

```
openid profile email
```

The provider should return at least:

- `sub`
- `name` or `preferred_username`

Email and profile image claims are optional.

Put the real OIDC values into `.env`, then recreate the API service:

```bash
cd /opt/hm-stats
docker compose up -d --force-recreate api
```

Read [OIDC setup](/self-hosting/oidc) for provider-specific details and troubleshooting.

---

## 12. Create the first workspace

The first workspace is created through an explicit one-time bootstrap process.

Generate a token:

```bash
cd /opt/hm-stats
docker compose exec api php artisan stats:bootstrap-token "My Clan" my-clan --ttl=60
```

The command prints:

```
mst_bootstrap_<uuid>_<secret>
```

The token is:

- displayed once
- single-use
- valid for the configured TTL
- unusable after the first workspace already exists

Now open:

```
https://stats.example.com/auth/login
```

Log in with your OIDC account.

Then open:

```
https://stats.example.com/setup
```

Paste the token and click **Initialize workspace**.

The OIDC account consuming the token becomes the initial workspace owner.

---

## 13. Register your Minecraft server

Open the dashboard:

```
https://stats.example.com/
```

Go to **Servers**.

Create an entry using the exact Minecraft hostname and port.

Example:

| Field | Example |
|---|---|
| Name | `craftattack` |
| Display name | `CraftAttack` |
| Hostname | `play.example.net` |
| Port | `25565` |

The server must be enabled.

### Important

HM Stats matches the reported Minecraft hostname + port.

If players connect through:

```
play.example.net:25565
```

register that exact endpoint.

A mismatch causes ingestion to fail.

---

## 14. Create the season

Go to **Seasons**.

Create a season such as:

```
Name: CraftAttack 14
Slug: craftattack-14
Activate immediately: yes
```

Valid slugs use lowercase letters/numbers and hyphens:

```
craftattack-14
```

Only one season is active at a time.

The ingestion server uses the active season as authority.

---

## 15. Create a client API key

Go to **API Keys**.

Create:

**Type:** Client

For one player, the recommended permissions are:

```
Scope:
  ingest:write

UUID restriction:
  the player's Minecraft UUID

Server restriction:
  the registered Minecraft server

Season restriction:
  the current season
```

After creation, HM Stats displays the full secret once.

The token looks like:

```
mst_client_<uuid>_<secret>
```

Save it immediately.

Do not put a client token into a public repository, website, issue or shared screenshot.

Read [API Keys](/dashboard/api-keys) for the full key model.

---

## 16. Install the Minecraft client

The HM Stats mod is installed **per player**.

The server operator does not install it into the dedicated Minecraft server.

For the current release the player needs:

- Minecraft 26.2
- Java 25
- Fabric Loader 0.19.3 or newer
- Fabric API compatible with Minecraft 26.2
- HM Stats client JAR

The current client CI produces an artifact named:

```
hm-stats-client
```

There is currently no automatic Modrinth or CurseForge publication configured in the repository.

For the exact filesystem paths and config format, see [Client installation and configuration](/client/configuration).

---

## 17. Configure the player

The client creates:

```
.minecraft/config/hm-stats.json
```

A typical configuration is:

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

Important:

```
api.url = https://stats.example.com
```

not:

```
https://stats.example.com/api/v1/ingest/batch
```

The client adds `/api/v1/ingest/batch` itself.

### Server allow-list

An empty `servers.allow` list means all servers.

For a clan client you can explicitly add:

```
play.example.net:25565
```

The comparison is case-insensitive and includes the port.

### Queue

The local upload queue is stored under:

```
.minecraft/config/hm-stats-queue/
```

The queue lets the client keep data during temporary network failures.

---

## 18. Verify one player end-to-end

Use one test player before distributing the setup to the whole clan.

### Server side

Confirm:

- health endpoints are 200
- workspace exists
- server exists and is enabled
- season is active
- client key exists
- key restrictions match the player's UUID/server/season

### Client side

Confirm:

- Minecraft is 26.2
- Fabric Loader is 0.19.3+
- HM Stats is in the correct `mods` folder
- `hm-stats.json` exists
- `enabled=true`
- API URL is correct
- client key is complete

Join the registered Minecraft server.

### Dashboard side

Open **Players**.

The player should appear after the first successful ingest.

Open **API Keys** and check **Last used**.

If the timestamp changes, the key was accepted by the server.

For client-side failures, use [Client troubleshooting](/client/troubleshooting).

For server-side failures, use [Troubleshooting](/troubleshooting/).

---

## 19. Add the remaining clan members

For each player:

1. get their Minecraft UUID
2. create a separate Client API key
3. restrict it to their UUID
4. restrict it to the correct server
5. restrict it to the current season
6. send the token and client configuration privately
7. have the player install the mod
8. verify **Last used**

Do not use one unrestricted client token for the whole clan.

A separate key per player gives you precise revocation and containment.

---

## 20. Website/API integration

Use a separate **Website** or **Integration** key for trusted server-side applications.

Typical read scopes:

```
players:read
stats:read
leaderboards:read
presence:read
```

Never expose such a key in frontend JavaScript.

API documentation:

- [API overview](/api/)
- [Endpoint reference](/api/endpoints)
- [OpenAPI v1](https://github.com/henrymmey/minecraft-stats-docs/blob/main/openapi/v1.yaml)

---

## 21. Backups

Back up PostgreSQL regularly.

Example:

```bash
cd /opt/hm-stats
docker compose exec -T postgres pg_dump   -U "$POSTGRES_USER"   -d "$POSTGRES_DB"   > hm-stats-backup.sql
```

Store the backup outside the server too.

A backup should be tested by restoring it into a separate PostgreSQL environment.

Do not delete the Docker volume as a way of "starting fresh" unless you intentionally want to destroy the database.

Read [Maintenance & backups](/self-hosting/maintenance).

---

## 22. Updating HM Stats

Back up first.

Pull the latest repositories:

```bash
cd /opt/hm-stats/minecraft-stats-docs
git pull

cd /opt/hm-stats/minecraft-stats-server
git pull

cd /opt/hm-stats/minecraft-stats-dashboard
git pull
```

Rebuild and restart:

```bash
cd /opt/hm-stats
docker compose up -d --build
```

The API container runs database migrations during startup.

Then verify:

```bash
curl -i https://stats.example.com/api/v1/health/ready
```

Keep your `.env`, PostgreSQL volume and Caddy certificate data.

---

## 23. Key rotation

When a key is exposed:

1. open **API Keys**
2. choose **Rotate**
3. copy the new secret immediately
4. replace the player's `api.key`
5. restart Minecraft
6. verify **Last used**

The old key is revoked by rotation.

Use **Revoke** when you want the key to stop working without creating a replacement.

---

## 24. Domain and HTTPS troubleshooting

### DNS does not point to the server

```bash
dig +short stats.example.com
```

Compare the result with your public server IP.

### HTTPS certificate is not issued

Check:

- DNS
- inbound TCP 80
- inbound TCP 443
- whether another web server already owns those ports

Inspect:

```bash
docker compose logs -f caddy
```

### Dashboard loads but API fails

Make sure Caddy routes:

```
/api/*  -> api:8000
/auth/* -> api:8000
```

and that the dashboard is served on the same hostname as the API.

---

## 25. Server troubleshooting

Check service state:

```bash
cd /opt/hm-stats
docker compose ps
```

Then:

```bash
docker compose logs -f api
docker compose logs -f postgres
```

Common causes:

- invalid `.env`
- missing `APP_KEY`
- invalid database credentials
- OIDC configuration mismatch
- PostgreSQL not healthy
- DNS/TLS issue

Use the request ID from API errors to correlate a failed API call with server logs.

---

## 26. Security checklist

Before opening the installation to the full clan:

- [ ] `APP_DEBUG=false`
- [ ] HTTPS works
- [ ] DNS is correct
- [ ] PostgreSQL is not public
- [ ] `APP_KEY` is persistent
- [ ] `API_KEY_PEPPER` is persistent
- [ ] OIDC client secret is private
- [ ] OIDC callback URL is exact
- [ ] first workspace owner is known
- [ ] server is registered and enabled
- [ ] season is active
- [ ] each player has a separate restricted client key
- [ ] website/integration keys are not in frontend code
- [ ] database backups exist
- [ ] a backup restore has been tested

---

## 27. Continue with the operator docs

After the base installation, read:

[Dashboard guide](/dashboard/)

[API Keys](/dashboard/api-keys)

[Servers & Seasons](/dashboard/servers-seasons)

[Client installation & configuration](/client/configuration)

[Domain & HTTPS](/self-hosting/domain)

[OIDC setup](/self-hosting/oidc)

[Maintenance & backups](/self-hosting/maintenance)

[Troubleshooting](/troubleshooting/)
