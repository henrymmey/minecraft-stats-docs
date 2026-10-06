# Client troubleshooting

Use the checks below before changing server code.

## "The mod does not send anything"

Check all of these:

1. Minecraft is 26.2.
2. Fabric Loader is 0.19.3 or newer.
3. Fabric API matches Minecraft 26.2.
4. HM Stats is present in the correct `mods` directory.
5. `config/hm-stats.json` exists.
6. `enabled` is `true`.
7. `api.url` is a valid HTTPS base URL.
8. `api.key` is present and has `ingest:write`.
9. The player's UUID is allowed by the key, when UUID restrictions are enabled.
10. The connected server is registered, enabled and matches hostname + port.
11. A season is active.
12. The client is not filtering the server through `servers.allow`.

## "Invalid URL"

The client accepts HTTPS URLs for normal deployments.

Examples:

```
https://stats.example.com
https://stats.example.com/
```

The client rejects normal HTTP URLs.

HTTP is allowed only for local development hosts such as `localhost`, `127.0.0.1` and `::1`.

Also make sure `api.url` does not already contain `/api/v1/ingest/batch`.

## "401 INVALID_API_KEY"

The server could not authenticate the Bearer token.

Check:

- the entire token was copied
- the token starts with `mst_client_`
- the key was not revoked
- the key has not expired
- the key belongs to the same HM Stats workspace

When in doubt, rotate the key in the dashboard and replace it in the client config.

## "403 FORBIDDEN"

Authentication worked, but authorization failed.

Typical causes:

- the key does not have `ingest:write`
- the player's UUID is not allowed
- the server is not allowed by the key
- the active season is not allowed by the key

Check the key restrictions in **Dashboard → API Keys**.

## "404 NOT_FOUND"

For ingestion, common causes are:

- the reported Minecraft server is not registered
- the registered server is disabled
- there is no active season

Open **Servers** and **Seasons** in the dashboard.

## The client is connected but upload attempts keep stopping

A permanent HTTP error causes the current upload flush to pause and leaves the queued data on disk.

Fix the underlying configuration, then restart Minecraft.

The queue directory is:

```
.minecraft/config/hm-stats-queue/
```

Do not delete the queue before deciding whether the queued data should be preserved.

## No player appears in the dashboard

A player is normally created by a successful ingestion request.

Check:

```
https://stats.example.com/api/v1/health/ready
```

Then verify the server, season, key and client configuration.

Look at **API Keys → Last used**. If the time never changes, the request is not reaching/using the key.

## Username changed

HM Stats uses the Minecraft UUID as the stable identity and updates the current username when the player connects.

A username change therefore should not create a different player identity.

## Need logs?

The client writes its normal logs through Minecraft's logging system. Search the latest `latest.log` for:

```
hm-stats
HM Stats
```

Never publish logs containing API credentials.

## Still stuck

For server-side failures, inspect:

```bash
docker compose logs -f app
docker compose logs -f postgres
```

For HTTP-level debugging, keep the request ID from the API error and use it to correlate the server log entry.
