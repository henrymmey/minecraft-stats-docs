# OIDC setup

HM Stats uses OpenID Connect (OIDC) for administrator login.

There is no local HM Stats dashboard password.

## What you need from your OIDC provider

Create a confidential web application/client.

You need:

- issuer URL
- client ID
- client secret

Set the exact redirect URI:

```
https://stats.example.com/auth/callback
```

Replace the hostname with your actual HM Stats hostname.

## Requested scopes

HM Stats requests:

```
openid profile email
```

The server uses the OIDC subject (`sub`) as the stable external identity.

For a useful dashboard profile, your provider should return:

- `sub`
- `name` or `preferred_username`
- `email` when available
- `picture` when available

The server will fall back to the subject for the display name if no name/preferred username is supplied.

## Server environment

Set:

```dotenv
OIDC_ISSUER=https://your-provider.example/...
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
OIDC_REDIRECT_URI=https://stats.example.com/auth/callback
OIDC_REQUIRE_HTTPS=true
```

After changing these variables:

```bash
cd /opt/hm-stats
docker compose up -d --force-recreate app
```

## Login flow

The browser flow is:

```
Dashboard
   |
   v
/auth/login
   |
   v
OIDC Provider
   |
   v
/auth/callback
   |
   v
HM Stats session
```

The server validates the OIDC response and creates/updates the corresponding local user.

The browser then receives a server-managed session.

## First administrator

OIDC login by itself does not grant ownership.

The first administrator must consume the one-time bootstrap token:

```bash
docker compose exec app php artisan stats:bootstrap-token "My Clan" my-clan --ttl=60
```

Then:

1. log in via `/auth/login`
2. open `/setup`
3. paste the token
4. initialize the workspace

That account becomes the workspace owner.

## Adding additional administrators

The API has workspace user management, but the current dashboard UI does not yet expose the complete administrator-management screen.

For the current release, only users with an owner/admin workspace membership can pass the dashboard's administrator middleware.

The roles in the API model are:

```
owner
admin
analyst
readonly
```

The analyst/readonly roles are not yet a complete dashboard permissions surface.

## Security requirements

In production:

- keep `OIDC_CLIENT_SECRET` private
- use HTTPS
- use the exact callback URI
- do not put OIDC secrets in the frontend
- do not store administrator tokens in localStorage
- keep the server session cookie HttpOnly

## Troubleshooting

### Redirect URI mismatch

Compare the provider configuration with:

```
https://stats.example.com/auth/callback
```

It must match exactly, including scheme, hostname, path and trailing slash behavior.

### Login succeeds but dashboard returns an error

Check:

```bash
docker compose logs -f app
```

Also verify that `APP_URL`, `OIDC_ISSUER` and `OIDC_REDIRECT_URI` all describe the same production host.

### Bootstrap returns INVALID_BOOTSTRAP_TOKEN

The token may be:

- expired
- already used
- copied incorrectly
- generated after a workspace already existed

Generate a fresh token only while no workspace exists.
