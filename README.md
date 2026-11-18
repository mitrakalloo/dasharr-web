# Dasharr Web

Mobile-first companion dashboard for your *arr stack. **Invite-only accounts**, Postgres-backed config, and **server-side encrypted API keys** — safe to expose behind HTTPS.

## Security model

- Browser never receives service API keys or passwords
- All *arr / download-client traffic goes through an authenticated BFF (`POST /api/proxy` with `serviceId` + relative `path` only)
- Secrets stored with AES-256-GCM (`DATA_ENCRYPTION_KEY`)
- Closed signup: first admin via `SETUP_TOKEN`, then household invites
- Audit log for bootstrap, invites, and service changes

## Docker (recommended)

```bash
cp .env.example .env
# fill BETTER_AUTH_SECRET, DATA_ENCRYPTION_KEY, SETUP_TOKEN (openssl rand -base64 32)

docker compose up --build
```

Open http://localhost:8787 → create admin with your `SETUP_TOKEN`.

## Develop

```bash
cp .env.example .env
docker compose up db -d
npm install
npm run db:push
npm run dev
```

- Web UI: http://localhost:5173  
- API: http://127.0.0.1:8787  

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Session signing secret |
| `BETTER_AUTH_URL` | Public app URL |
| `DATA_ENCRYPTION_KEY` | Encrypts service secrets at rest |
| `SETUP_TOKEN` | One-time first-admin bootstrap |
| `TRUSTED_ORIGINS` | Allowed CORS origins (comma-separated) |

Put Dasharr behind HTTPS (Caddy/Traefik/nginx) when exposed to the internet. Do not publish Postgres ports publicly.
