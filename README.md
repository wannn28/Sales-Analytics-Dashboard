# Sales Analytics Dashboard

A full-screen React + TypeScript sales workspace modeled on the supplied analytics reference. The app opens with secure sign-in, then loads revenue, platform, chart, and team-performance data from a Go API backed by PostgreSQL.

## Features

- Full-viewport responsive workspace with two-level navigation, charts, filters, timeframe selector, search, export, report creation, and sign-out.
- HTTP-only SameSite sessions, bcrypt passwords, origin checks, login throttling, and protected dashboard endpoints.
- PostgreSQL schema for users, sessions, employees, platforms, customers, and deals with deterministic demo seed data.
- Recharts visualizations for referrer distribution, platform value, and sales dynamics.
- VPS deployment files for a loopback-only Go service, isolated PostgreSQL container, Nginx, and HTTPS through Certbot webroot.

## Stack

React 19, TypeScript, Vite, Recharts, Lucide React, Inter, Go 1.26, pgx/v5, PostgreSQL, Nginx, systemd, Docker, Certbot, and Cloudflare DNS.

## Structure

`src/components` contains reusable layout and dashboard components. `src/pages` contains Login and Dashboard views. `src/services` contains the typed API client. `backend/internal` contains handlers, service, repository, config, and models. `backend/migrations` contains schema and seed SQL. `deploy` contains the service, Nginx configuration, and VPS runbook. `tests` contains API integration checks.

## Local development

```bash
npm install
npm run dev
```

Set `DATABASE_URL` and `HTTP_ADDR` from `.env.example`, then run:

```bash
cd backend
go mod download
go run ./cmd/server migrate
go run ./cmd/server seed
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='choose-a-strong-password' go run ./cmd/server create-admin
go run ./cmd/server
```

The Vite server proxies `/api` to `127.0.0.1:18080`.

## Validation

```bash
npm run build
cd backend && go test ./...
TEST_EMAIL=admin@example.com TEST_PASSWORD='choose-a-strong-password' npm run test:api
```

The API test covers login, protected routes, origin validation, session revocation, filters, aggregate consistency, and endpoint health.

## Production

See [deploy/README.md](deploy/README.md). The configured production domain is `https://sales.iquee.tech`. PostgreSQL listens only on a loopback port, and Nginx is reloaded only after `nginx -t` succeeds.

Do not commit `.env`, passwords, private keys, or generated release archives. The repository contains synthetic demo data; add authorization rules before using confidential business data.
