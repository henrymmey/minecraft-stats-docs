# HM Stats

HM Stats is a self-hosted statistics platform for Minecraft communities.

A typical installation has three externally visible pieces:

- **HM Stats Server** — Laravel API and PostgreSQL-backed data store.
- **HM Stats Dashboard** — the browser interface used by administrators.
- **HM Stats Client** — a client-side Fabric mod installed by each participating Minecraft player.

The Minecraft server does **not** need the HM Stats mod installed. The Fabric mod runs on the player's own Minecraft client and uploads data to your HM Stats server over HTTPS.

## How data flows

```
Player's Minecraft client
        |
        | HTTPS + client API key
        v
HM Stats Server
        |
        +--> PostgreSQL
        |
        +--> Dashboard
        |
        +--> Website / integrations
```

The server decides which workspace, player, server and season a request belongs to. Client-supplied workspace information is never trusted as authorization.

## Core concepts

### Workspace

One isolated HM Stats installation space. Your clan normally has one workspace.

### Player

A Minecraft UUID plus the currently known username(s). The UUID is the stable identity; usernames can change.

### Server

A Minecraft server registered by hostname and port, for example `play.example.net:25565`.

### Season

A reporting period such as a CraftAttack season, clan event or tournament. Ingestion normally uses the currently active season.

### Client API key

A credential placed in a player's Minecraft client. It normally needs `ingest:write` and should be restricted to the player's UUID, your registered Minecraft server and the current season.

### Website / integration API key

A read credential used by trusted server-side software. Do not put these secrets into browser JavaScript.

## What HM Stats collects

Protocol v1 can contain Minecraft UUID, username, observed server hostname/port, timestamps, session IDs, absolute statistic values and idempotent client events.

It does **not** include chat messages, coordinates, screenshots, files or private messages.

## Current implementation status

The current dashboard release provides working screens for:

- Overview
- First-run setup
- API Keys
- Players
- Servers
- Seasons

The dashboard routes for Statistics, Sessions, Events, Leaderboards, Admins, Audit Log and Settings currently exist as navigation placeholders. Their API/data model is documented where applicable, but those dashboard pages are not yet complete.

Start a new installation with [Installation](/installation/).
