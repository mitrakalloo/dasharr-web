# Dasharr Web

Mobile-first companion dashboard for your *arr stack. **Invite-only accounts**, Postgres-backed config, and **server-side encrypted API keys** — safe to expose behind HTTPS.

## Security model

- Browser never receives service API keys or passwords
- Authenticated BFF: `POST /api/proxy` (+ `/api/proxy/batch`) with `serviceId` + relative `path`
- Secrets at rest: AES-256-GCM (`DATA_ENCRYPTION_KEY`)
- Closed signup: `SETUP_TOKEN` → first admin → household invites
- Per-user experience prefs; shared household dashboards (SSE live sync)
- Audit log, password change, session revoke

## Docker (recommended)

```bash
cp .env.example .env
# openssl rand -base64 32  → BETTER_AUTH_SECRET, DATA_ENCRYPTION_KEY, SETUP_TOKEN

docker compose up --build
```

Open http://localhost:8787 → bootstrap admin with `SETUP_TOKEN`.

### HTTPS with Caddy

```bash
# .env: DASHARR_DOMAIN=dasharr.example.com
#       BETTER_AUTH_URL=https://dasharr.example.com
#       TRUSTED_ORIGINS=https://dasharr.example.com

docker compose -f docker-compose.yml -f docker-compose.proxy.yml up --build
```

Traefik label examples: `docker/traefik.example.yml`.

### Backup & key rotation

```bash
# Backup Postgres
docker compose exec -T db pg_dump -U dasharr dasharr > dasharr-$(date +%F).sql

# Restore
cat dasharr-YYYY-MM-DD.sql | docker compose exec -T db psql -U dasharr dasharr
```

`DATA_ENCRYPTION_KEY` must stay stable to decrypt service secrets. To rotate:

1. Take a DB backup  
2. Add services again (or write a one-off decrypt-with-old / encrypt-with-new script)  
3. Update `DATA_ENCRYPTION_KEY` and recreate the app container  

Losing the encryption key means losing stored API keys (re-enter them in Settings).

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
| `OIDC_CLIENT_ID` | Optional SSO (generic OIDC) |
| `OIDC_CLIENT_SECRET` | Optional SSO |
| `OIDC_DISCOVERY_URL` | Optional SSO discovery document URL |

Do not publish Postgres ports on the public internet.
