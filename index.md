---
layout: home

hero:
  name: HM Stats
  text: Self-hosted Minecraft statistics for clans and communities.
  tagline: A practical guide for installing the server, connecting your domain, configuring the dashboard, and installing the client.
  actions:
    - theme: brand
      text: Install HM Stats
      link: /installation/
    - theme: alt
      text: Dashboard Guide
      link: /dashboard/
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: Clan-admin focused
    details: Follow the installation from an empty Linux server to a working dashboard and connected Minecraft clients.
  - title: Client-side Fabric mod
    details: Players install the HM Stats client locally; the Minecraft server itself does not need the mod.
  - title: Self-hosted
    details: Keep PostgreSQL, the API and dashboard under your own infrastructure and domain.
  - title: Scoped API keys
    details: Separate client ingestion keys from website/integration read keys and restrict them to players, servers and seasons.
  - title: HTTPS + OIDC
    details: Use a real domain, TLS and OpenID Connect for administrator authentication.
  - title: Open API
    details: Integrate your own clan website or tools with the versioned REST API and OpenAPI specification.
---

## Start here

**New installation:** [Installation guide](/installation/)

**Already installed:** [Dashboard guide](/dashboard/) · [Client guide](/client/) · [API reference](/api/)

> **Current release note:** the HM Stats client targets **Minecraft 26.2**, Java 25 and Fabric Loader 0.19.3 or newer.

The documentation is written primarily for clan and community administrators. Developer notes are kept separate under [Development](/development/).
