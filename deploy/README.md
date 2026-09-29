# VPS runbook

Target: `sales.iquee.tech`, VPS `151.106.120.69`. This is an isolated static site and systemd API; existing containers and sites must not be changed.

1. Add Cloudflare CNAME `sales` → `iquee.tech` with proxy enabled. Use Full (strict) after the origin certificate is installed.
2. Inspect `ss -lntp`, `nginx -T`, available disk/memory, PostgreSQL version and current certificates before installing anything. Port 3002 is a candidate, **not a reservation**. Ports 8001, 3005, 8009 and 3006 belong to other applications. If 3002 is used, choose another verified free loopback port and update both Nginx and the environment file.
3. Build frontend with `npm ci && npm run build`; cross-compile API with `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o sales-api ./cmd/server` from `backend/` (check server architecture first).
4. Create unprivileged system account `sales-dashboard`. Install release files under `/opt/sales-dashboard/releases/<commit>/`; point `/opt/sales-dashboard/current` to that release. Copy static assets to `/var/www/sales-dashboard`, owned by root and readable by Nginx. Preserve the previous release for rollback.
5. Create a dedicated PostgreSQL role and database named `sales_dashboard`. Use a generated password stored only in `/etc/sales-dashboard.env` (mode 0600, owner root). Bind PostgreSQL to localhost or a Unix socket; never publish port 5432. Do not change an existing server's listen addresses or roles. Set `DATABASE_URL=postgres://sales_dashboard:PASSWORD@127.0.0.1:5432/sales_dashboard?sslmode=disable` and `HTTP_ADDR=127.0.0.1:3002`.
6. Run `sales-api migrate`, then `sales-api seed` with this environment. Seed is for this demo database only. Install `sales-dashboard.service` to `/etc/systemd/system/`, then `systemctl daemon-reload` and `systemctl enable --now sales-dashboard`. Verify `curl --fail http://127.0.0.1:3002/api/health`.
7. Install **only** the new site config as `/etc/nginx/sites-available/sales-dashboard`, linking it into `sites-enabled`. Start with `nginx-http.conf`. Run `nginx -t && systemctl reload nginx`. Never restart Nginx or reboot the server.
8. Use `certbot certonly --webroot -w /var/www/letsencrypt -d sales.iquee.tech` with the server's existing ACME account. Do not use `certbot --nginx`. Check that the ACME challenge path reaches the webroot through Cloudflare. Do not overwrite existing renewal configuration.
9. Switch this site's file to `nginx.conf`, then run `nginx -t && systemctl reload nginx`. Add a certificate deploy hook scoped to this certificate that runs `nginx -t && systemctl reload nginx` and verify the existing renewal timer. Never restart Nginx.
10. Verify public HTTPS, `/api/health`, each data endpoint, frontend API requests and systemd `is-enabled`/`is-active`. Check that existing sites still respond. A reboot is not required to verify enablement.

Rollback: restore the previous static release and `current` symlink; restart **only** `sales-dashboard.service`. Restore only this site's previous Nginx file if necessary, validate and reload Nginx. Database backups should be taken with `pg_dump` before any later schema changes. No rollback should remove or modify other sites.

This application intentionally exposes synthetic demo data. Add authentication and authorization before substituting confidential business data.
