# Dashboard

The HM Stats Dashboard is the administrator interface for your workspace.

Open it at your configured hostname, for example:

```
https://stats.example.com/
```

The dashboard does not store an administrator password. When an unauthenticated request is made, it starts the server's OIDC login flow.

## First login

After the server and OIDC provider are configured:

1. Open `/auth/login`.
2. Sign in at your OIDC provider.
3. Open `/setup`.
4. Paste the one-time bootstrap token generated on the server.
5. Click **Initialize workspace**.

The account that consumes the token becomes the first workspace owner.

Once the workspace exists, normal administration is performed by owner/admin accounts.

## Overview

The current Overview page shows:

- the signed-in display name
- the email claim, when present
- the workspace role
- the workspace ID

It is mainly an account and installation sanity check in the current release.

## Current dashboard pages

| Page | Current state | Purpose |
|---|---|---|
| Overview | Available | Account and workspace information |
| Setup | Available | One-time workspace bootstrap |
| API Keys | Available | Create, edit, rotate and revoke API keys |
| Players | Available | View players known to the workspace |
| Servers | Available | Register Minecraft servers |
| Seasons | Available | Create and activate seasons |
| Statistics | Placeholder | Planned statistics UI |
| Sessions | Placeholder | Planned session UI |
| Events | Placeholder | Planned event UI |
| Leaderboards | Placeholder | Planned leaderboard UI |
| Admins | Placeholder | Planned administrator management UI |
| Audit Log | Placeholder | Planned audit log UI |
| Settings | Placeholder | Planned settings UI |

The API already exposes more functionality than the current dashboard UI. Use the [API reference](/api/) for integrations and API-level administration.

## Same-origin requirement

The current frontend calls:

```
/api/v1/...
/auth/...
```

as relative URLs.

For the deployment described by these docs, keep the dashboard and API on the same hostname. Example:

```
https://stats.example.com/                -> dashboard
https://stats.example.com/api/v1/...      -> API
https://stats.example.com/auth/login       -> OIDC login
```

This also keeps the server-side session cookie on the correct origin.

## Common tasks

To manage a new clan server, the normal order is:

**Servers → Seasons → API Keys → Clients**

Register the exact Minecraft hostname/port first, create or activate the correct season, then create restricted client keys.

For a website, create a separate **Website** or **Integration** key instead of reusing a client key.

## Logging out

The server exposes a POST logout endpoint at `/auth/logout`. A production UI should keep the browser session on the server and never move OIDC access tokens into localStorage.
