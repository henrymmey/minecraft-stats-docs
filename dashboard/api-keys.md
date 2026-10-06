# API Keys

API keys are the credentials used by Minecraft clients and trusted integrations.

Open **API Keys** in the dashboard.

## Key types

### Client

Use for the HM Stats Fabric mod.

Required scope:

```
ingest:write
```

Recommended restrictions:

- one or more Minecraft UUIDs
- one or more registered servers
- one or more seasons

A client key should normally be limited to exactly the player and server it needs.

### Website

Use for a trusted server-side clan website.

Typical scopes:

```
players:read
stats:read
leaderboards:read
presence:read
```

A website key cannot have `ingest:write`.

Do not put it into frontend JavaScript or the browser's public page source.

### Integration

Use for other trusted server-side tools.

Give it only the read scopes the integration actually needs.

## Available scopes

| Scope | Purpose |
|---|---|
| `ingest:write` | Upload client statistics/events |
| `players:read` | List/read public players |
| `stats:read` | Read player statistics and seasons |
| `events:read` | Reserved for event-read integrations |
| `sessions:read` | Reserved for session-read integrations |
| `leaderboards:read` | Read leaderboards |
| `presence:read` | Read currently online players |

The current HTTP route set does not yet provide separate event/session read endpoints, so `events:read` and `sessions:read` are currently reserved permissions.

## Create a key

1. Open **API Keys**.
2. Enter a descriptive name, such as `Henry - CraftAttack Client`.
3. Select the key type.
4. Select the smallest possible set of scopes.
5. Add UUID, server and season restrictions.
6. Create the key.
7. Copy the secret immediately.

The full secret is shown only in the create/rotate response. HM Stats does not store the raw secret for later recovery.

## UUID restrictions

An empty UUID restriction list means the key can operate on every player allowed by the rest of the authorization rules.

For player-specific client keys, add the exact Minecraft UUID.

UUIDs can be added manually even before the player has ever connected.

## Server restrictions

An empty server restriction list means all registered servers in the workspace.

For a clan client, select only the server where the player should upload data.

The ingest request is matched by hostname + port and the server must also be registered and enabled.

## Season restrictions

An empty season restriction list means all seasons.

For a client that should only work for the current event, restrict it to the current season.

The server remains authoritative about the active season.

## Rotate a key

Use **Rotate** when a key may have been exposed or you want to replace it without manually recreating the restrictions.

Rotation:

1. revokes the current key
2. creates a replacement key
3. keeps the key's name/type/scopes/restrictions
4. shows the new secret once

Update the player's `hm-stats.json` with the new token after rotation.

## Revoke a key

Use **Revoke** when the credential must stop working permanently.

A revoked key cannot be recovered. Create a new key when access is needed again.

## Best practice for a clan

Do not create one unrestricted client key and give it to the entire clan.

A safer setup is one client key per player, restricted to:

- that player's UUID
- the clan's registered Minecraft server
- the current season
- `ingest:write`

This also makes revocation and auditing much easier.
