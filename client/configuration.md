# Client installation and configuration

This page is written for the players who install the HM Stats client and for admins distributing the configuration.

## What players need

For the current release:

- Minecraft **26.2**
- Java **25**
- Fabric Loader **0.19.3 or newer**
- Fabric API compatible with Minecraft 26.2
- HM Stats client JAR

The HM Stats client is a **client-only** Fabric mod. Do not install it on a dedicated Minecraft server as a server-side plugin/mod requirement.

## Installing the JAR

With a normal Fabric Minecraft installation, put the HM Stats client JAR into the Fabric instance's `mods` directory.

Also install a matching Fabric API build for Minecraft 26.2.

Start Minecraft once and exit again. HM Stats will create:

```
.minecraft/config/hm-stats.json
```

The upload queue directory is:

```
.minecraft/config/hm-stats-queue/
```

### Where is .minecraft?

Typical launcher locations are:

**Windows**

```
%APPDATA%\.minecraft
```

**Linux**

```
~/.minecraft
```

**macOS**

```
~/Library/Application Support/minecraft
```

Custom launchers/instances may use a different instance directory. Use that instance's `config` folder.

## Where to get the client JAR

The current GitHub Actions workflow builds the mod and uploads an artifact named:

```
hm-stats-client
```

The repository does not currently configure automatic Modrinth or CurseForge publishing.

Admins should distribute a trusted build from the project's GitHub repository or the project's official release process when one is added.

## Configure the API

Open:

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
    "allow": []
  },
  "privacy": {
    "sendStatistics": true,
    "sendAdvancements": true,
    "sendEvents": true
  }
}
```

The most important fields are:

| Field | Meaning | Recommended |
|---|---|---|
| `enabled` | Enables telemetry processing/uploads | `true` |
| `api.url` | Base URL of your HM Stats Server | `https://stats.example.com` |
| `api.key` | Player's client API key | unique restricted key |
| `upload.intervalSeconds` | Snapshot interval | `60` |
| `upload.batchSize` | Max observations per queued batch | `100` |
| `upload.maxQueueSize` | Local queue capacity | `5000` |
| `servers.allow` | Optional exact `host:port` allow-list | your clan server |
| `privacy.sendStatistics` | Sends statistics | according to clan policy |
| `privacy.sendAdvancements` | Advancement telemetry toggle | currently not used by the controller |
| `privacy.sendEvents` | Sends client events such as session start/end | according to clan policy |

### API URL

Set only the server base URL:

```
https://stats.example.com
```

Do **not** set:

```
https://stats.example.com/api/v1/ingest/batch
```

The client appends `/api/v1/ingest/batch` itself.

Production URLs must use HTTPS.

Plain HTTP is accepted only for local hosts:

```
http://localhost
http://127.0.0.1
http://::1
```

## Server allow-list

The allow-list contains exact server addresses in the form:

```
hostname:port
```

Example:

```json
"servers": {
  "allow": [
    "play.example.net:25565"
  ]
}
```

An empty list means the client does not filter by server.

The comparison is case-insensitive and includes the port.

For a clan installation, an allow-list is a useful second layer: the API key restricts the player/server on the server side, while the client avoids uploading when the player is on an unrelated server.

## Privacy controls

### Statistics

When `sendStatistics` is enabled, the client collects absolute Minecraft statistic values and uploads only changed observations.

### Advancements

The setting is present in the configuration model, but the current telemetry controller does not currently use it. Do not describe the current release as collecting advancement data solely because this option exists.

### Events

The current controller uses events for session lifecycle information such as:

```
SESSION_STARTED
SESSION_ENDED
```

## Upload and retry behavior

The client queues outgoing data on disk instead of requiring a successful request immediately.

Transient failures are retried, including:

- network failures
- HTTP 408
- HTTP 429
- HTTP 5xx

Permanent failures such as 400/401/403/404 stop the current flush and keep queued data so the admin/player can fix the configuration.

Retry delays use exponential backoff and are bounded.

## Queue limits

The default queue limit is 5000 batches.

When the queue is full, the client logs that a batch was dropped. Keep an eye on the queue when the API is unavailable for a long period.

## Disabling the client

Set:

```json
"enabled": false
```

Then restart Minecraft.

## After changing the API key

If the admin rotates the key:

1. replace `api.key` in `hm-stats.json`
2. save the file
3. restart Minecraft
4. join the registered server

The old key must no longer be used.

## Keep keys private

A client key is not a server password. The player can technically inspect it because it is stored on their computer.

Still avoid publishing it, and use server-side UUID/server/season restrictions so a leaked client key has limited scope.
