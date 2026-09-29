#!/usr/bin/env bash
# Run once as root with a release directory containing sales-api, dist/, and deploy/.
set -euo pipefail
release="$(realpath "${1:?Pass the uploaded release directory}")"
[[ "$release" == /opt/sales-dashboard/releases/* ]] || exit 1
test -x "$release/sales-api"
test -f "$release/dist/index.html"
test ! -e /etc/sales-dashboard.env
test ! -e /etc/nginx/sites-available/sales-dashboard
! docker container inspect sales-dashboard-db >/dev/null 2>&1
! docker volume inspect sales-dashboard-pgdata >/dev/null 2>&1
test -z "$(ss -H -lnt 'sport = :3002')"
test -z "$(ss -H -lnt 'sport = :55435')"
umask 077
id sales-dashboard >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin sales-dashboard
db_admin_password="$(openssl rand -hex 32)"
db_app_password="$(openssl rand -hex 32)"
login_password="$(openssl rand -hex 14)"
printf 'POSTGRES_USER=sales_owner\nPOSTGRES_PASSWORD=%s\nPOSTGRES_DB=postgres\n' "$db_admin_password" > /etc/sales-dashboard-db.env
printf 'DATABASE_URL=postgres://sales_dashboard:%s@127.0.0.1:55435/sales_dashboard?sslmode=disable\nHTTP_ADDR=127.0.0.1:3002\nCOOKIE_SECURE=true\n' "$db_app_password" > /etc/sales-dashboard.env
printf 'URL: https://sales.iquee.tech\nEmail: admin@sales.iquee.tech\nPassword: %s\n' "$login_password" > /root/sales-dashboard-access.txt
docker volume create sales-dashboard-pgdata >/dev/null
docker run -d --name sales-dashboard-db --restart unless-stopped --memory 384m --cpus 0.5 \
 --env-file /etc/sales-dashboard-db.env -p 127.0.0.1:55435:5432 \
 -v sales-dashboard-pgdata:/var/lib/postgresql/data \
 --health-cmd 'pg_isready -U sales_owner -d postgres' --health-interval 10s --health-timeout 5s --health-retries 5 \
 postgres:16-alpine -c shared_buffers=64MB -c max_connections=40 >/dev/null
for i in {1..30}; do docker exec sales-dashboard-db pg_isready -U sales_owner -d postgres >/dev/null 2>&1 && break; sleep 1; done
printf "CREATE ROLE sales_dashboard LOGIN PASSWORD '%s';\nCREATE DATABASE sales_dashboard OWNER sales_dashboard;\n" "$db_app_password" | docker exec -i sales-dashboard-db psql -v ON_ERROR_STOP=1 -U sales_owner -d postgres
set -a
source /etc/sales-dashboard.env
set +a
"$release/sales-api" migrate
"$release/sales-api" seed
ADMIN_EMAIL=admin@sales.iquee.tech ADMIN_PASSWORD="$login_password" "$release/sales-api" create-admin
ln -s "$release" /opt/sales-dashboard/current
ln -s "$release/dist" /var/www/sales-dashboard
chmod -R a+rX "$release/dist"
install -m 644 "$release/deploy/sales-dashboard.service" /etc/systemd/system/sales-dashboard.service
systemctl daemon-reload
systemctl enable --now sales-dashboard
curl --retry 10 --retry-connrefused --retry-delay 1 --fail http://127.0.0.1:3002/api/health
install -d -m 755 /var/www/letsencrypt/.well-known/acme-challenge
install -m 644 "$release/deploy/nginx-http.conf" /etc/nginx/sites-available/sales-dashboard
ln -s /etc/nginx/sites-available/sales-dashboard /etc/nginx/sites-enabled/sales-dashboard
nginx -t
systemctl reload nginx
printf '\nBootstrap complete. Issue the certificate using webroot, then install the HTTPS config.\n'
