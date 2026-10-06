# Client

The HM Stats Client is a **client-side Fabric mod**. Each participating player installs it locally.

The Minecraft server itself does not need the mod.

## Compatibility

Current target:

- Minecraft **26.2**
- Java **25**
- Fabric Loader **0.19.3 or newer**
- Fabric API compatible with Minecraft 26.2

## Install

Install Fabric for Minecraft 26.2, install a compatible Fabric API, then place the HM Stats JAR in the Fabric instance's `mods` directory.

The current CI workflow uploads a build artifact named `hm-stats-client`. Automatic Modrinth/CurseForge publishing is not configured yet.

## Configure

The configuration file is:

```
.minecraft/config/hm-stats.json
```

The client creates it automatically on first launch.

Use the full [Client installation and configuration](/client/configuration) guide for API URL/key setup, restrictions, privacy settings, upload intervals, retries and queue handling.

## Data model

Protocol v1 sends player identity, observed server, session/timestamps, absolute statistic observations and client events.

It does not send chat, coordinates, screenshots, files or private messages.

## Troubleshooting

When something is not uploaded, start with [Client troubleshooting](/client/troubleshooting).
