# Maintenance and backups

A self-hosted HM Stats installation is a normal production service: back up the database, monitor the containers and update deliberately.

## Back up PostgreSQL

From the deployment directory:

```bash
cd /opt/hm-stats
docker compose exec -T postgres pg_dump -U "$DB_USERNAME" -d "$DB_DATABASE" > hm-stats-backup.sql
```

Store the backup outside the server as well.

The database contains your workspace, players, server/season configuration and statistics.

## Test restores

A backup is only useful if it can be restored.

Test restoration on a separate PostgreSQL instance before relying on the backup for disaster recovery.

A restore command against an existing target is:

```bash
cat hm-stats-backup.sql | docker compose exec -T postgres psql -U "$DB_USERNAME" -d "$DB_DATABASE"
```

Choose the exact restore strategy for your disaster-recovery environment; do not blindly restore over a production database.

## Update the server

Back up first.

```bash
cd /opt/hm-stats/minecraft-stats-server
git pull

cd /opt/hm-stats
docker compose build app
docker compose up -d
```

The current container startup runs Laravel migrations automatically.

Check:

```bash
docker compose ps
docker compose logs -f app
```

Then verify:

```bash
curl -i https://stats.example.com/api/v1/health/ready
```

## Update the dashboard

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

The dashboard is static, so replacing `dist` does not modify PostgreSQL.

## Environment and secrets

Keep the deployment environment at:

```
/opt/hm-stats/.env
```

Do not put it in Git.

Important values include:

- `APP_KEY`
- `DB_PASSWORD`
- `OIDC_CLIENT_SECRET`
- `API_KEY_PEPPER`

Changing `API_KEY_PEPPER` changes how API secrets are verified. Treat it as persistent installation data and preserve it across upgrades.

## Container logs

Useful commands:

```bash
docker compose logs -f app
docker compose logs -f postgres
docker compose ps
```

Keep in mind that logs are operational data. Do not publish raw credentials or session data.

## Before a season change

Recommended process:

1. Create the new season.
2. Activate it.
3. Decide whether client API keys should be restricted to the new season.
4. Update/rotate client keys as needed.
5. Test one player's upload.
6. Roll the new configuration to the remaining players.

## Before an upgrade

Use this checklist:

- [ ] database backup exists
- [ ] backup restore has been tested recently
- [ ] deployment Git commits are known
- [ ] `.env` is safe
- [ ] OIDC credentials are known
- [ ] one client key can be rotated if needed
- [ ] health endpoint is monitored
