# Introduction

HM Stats is a generic open-source system for collecting Minecraft client statistics and exposing them through a self-hosted API.

It consists of four repositories:

- Fabric client
- Laravel server
- React dashboard
- Documentation and OpenAPI contract

The platform is designed so that an installation can be used by a clan, community, private server network or another Minecraft project without changing the client source code.

## Core concepts

**Workspace** — an isolated installation namespace inside the server.

**Season** — a period such as a CraftAttack season or a community event.

**Server** — a registered Minecraft server identified by hostname and port.

**Player** — a Minecraft UUID and its known usernames.

**API key** — a scoped credential used by a client or integration.

**Session** — a Minecraft client play session.

**Statistic** — an absolute numeric observation such as a Minecraft statistic.

**Event** — an idempotent point-in-time occurrence.
