# Servers and seasons

Servers and seasons are the two resources that must be configured before a client can ingest data.

## Servers

Open **Servers** in the dashboard.

Create a server with:

- **Name** — stable internal identifier, such as `craftattack`
- **Display name** — human-readable label, such as `CraftAttack`
- **Hostname** — the actual Minecraft hostname
- **Port** — the actual Minecraft port

Example:

| Field | Value |
|---|---|
| Name | `craftattack` |
| Display name | `CraftAttack` |
| Hostname | `play.example.net` |
| Port | `25565` |

### Why the exact hostname matters

The client reports the hostname and port of the server it is connected to.

During ingestion, HM Stats normalizes the hostname to lowercase and removes a trailing dot, then matches it together with the port.

So:

```
play.example.net:25565
```

must be registered exactly as the client will observe it.

### Enable/disable

Servers are enabled by default when created.

Ingestion requires the registered server to be enabled.

The current dashboard exposes server creation directly. The API also exposes a server update endpoint for changing the display name, hostname, port and enabled state.

## Seasons

Open **Seasons**.

Create a season with:

- **Name** — human-readable title
- **Slug** — lowercase letters/numbers with hyphens
- **Activate immediately** — whether the season becomes the active season

Example:

```
Name: CraftAttack 14
Slug: craftattack-14
Active: yes
```

Valid slug:

```
craftattack-14
```

Invalid examples:

```
CraftAttack 14
craft_attack_14
craftattack/14
```

### Active season

Only one season can be active in a workspace.

When a new season is created as active, or an existing season is activated, the other seasons are set inactive.

The ingestion service uses the active season as its authoritative season. A client can send an optional season hint, but that hint does not override the server's active-season decision.

## Recommended season workflow

At the start of a new clan event:

1. Create the new season.
2. Activate it.
3. Update/recreate client key restrictions if they are season-restricted.
4. Give players the new client configuration only when appropriate.
5. Verify a fresh upload reaches the new season.

At the end of the event, deactivate/replace the season as part of the next season workflow.

## Common mistake

If clients return an error saying that no active season is configured, check **Dashboard → Seasons** first.

If a client is restricted to Season A but the workspace is currently using Season B, ingestion will be rejected.
