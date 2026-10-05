# Fabric Client

The client is a physical-client-only Fabric mod. Fabric's `client` entrypoint is used so it is not loaded on dedicated servers.

## Configuration

The client stores its configuration under the Minecraft config directory:

```
config/minecraft-stats.json
```

Example:

```json
{
  "enabled": true,
  "api": {
    "url": "https://stats.example.com",
    "key": "mst_client_..."
  }
}
```

Never commit a real API key.

See the repository protocol specification:

https://github.com/henrymmey/minecraft-stats-client/blob/main/PROTOCOL.md
