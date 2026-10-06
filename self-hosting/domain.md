# Domain and HTTPS

A production HM Stats installation should have a public HTTPS hostname.

The easiest topology is:

```
https://stats.example.com/
  -> Dashboard

https://stats.example.com/api/v1/...
  -> HM Stats Server

https://stats.example.com/auth/...
  -> HM Stats Server
```

## DNS

Create an A record:

```
stats.example.com -> <server IPv4>
```

Add an AAAA record when your server has working IPv6.

After DNS propagates, verify:

```bash
dig +short stats.example.com
```

The result should contain the public address of your HM Stats server.

## Firewall

Allow inbound:

- TCP 80
- TCP 443

You normally do not need to expose TCP 8000 to the internet because the reference deployment binds it to `127.0.0.1`.

Do not expose TCP 5432.

## Caddy configuration

The reference Caddy configuration is:

```caddy
stats.example.com {
    encode gzip

    handle /api/* {
        reverse_proxy 127.0.0.1:8000
    }

    handle /auth/* {
        reverse_proxy 127.0.0.1:8000
    }

    root * /srv/hm-stats-dashboard
    try_files {path} /index.html
    file_server
}
```

This does two important things:

- forwards API and OIDC requests to Laravel
- falls back to `index.html` so React Router routes continue to work

Validate the configuration:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

Then reload:

```bash
sudo systemctl reload caddy
```

## TLS

Caddy obtains and renews certificates automatically when:

- the hostname resolves to the server
- TCP 80 and 443 reach the server
- another service is not already occupying those ports

Test the certificate:

```bash
curl -I https://stats.example.com/
```

## Reverse proxy alternatives

Nginx, Apache or a managed load balancer can also be used.

Whatever proxy you use must provide the same routing:

```
/api/*  -> Laravel server
/auth/* -> Laravel server
/*      -> dashboard static files
```

Keep the original path when proxying `/api/*` and `/auth/*`.

## Cloudflare and other proxies

When putting the hostname behind a CDN/proxy, make sure the proxy still forwards HTTPS requests correctly to the origin and that your TLS mode is appropriate for your setup.

The important property for HM Stats is that the browser sees a normal HTTPS URL and the server receives the correct `Host`, path and secure connection.

## Common domain failures

### DNS points somewhere else

Run:

```bash
dig +short stats.example.com
```

Compare it with the public IP of the host running Caddy.

### Port 443 is closed

Check your host firewall and your cloud provider security group.

### Caddy cannot issue a certificate

Check DNS, TCP 80/443, Caddy logs and whether another web server already owns the ports.

### Dashboard loads but API calls fail

Confirm the dashboard and API are on the same hostname and that the proxy sends `/api/*` to port 8000.

### Login callback fails

The OIDC redirect URI must exactly match:

```
https://stats.example.com/auth/callback
```

Also check `APP_URL` and `OIDC_REDIRECT_URI` in the server environment.
