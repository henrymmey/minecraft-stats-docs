# Security

Minecraft client API keys are authorization credentials, not secrets. A player controls their own Minecraft installation and can inspect the key.

Use:

- least-privilege scopes
- UUID restrictions
- server restrictions
- season restrictions
- expiry
- revocation
- rate limits
- audit logging

Website read keys must remain server-side. Never embed them in browser JavaScript.

Administrator authentication uses OpenID Connect and a secure server-side session.

The server must be deployed behind HTTPS in production.
