# Dasharr Web

Mobile-first companion dashboard for your *arr stack — inspired by [Dasharr](../dasharr) and [nzb360](https://nzb360.com/). Configs live in an encrypted local vault (no accounts, no DB).

## UI

- Mobile: sticky bottom tabs (Overview · Queue · Calendar · Search)
- Desktop (`lg+`): collapsible left rail, command palette (`⌘K`), live queue sidebar
- OLED dark theme with *arr accent badges
- Screens: Requests, Library, Wanted, History, title detail, Settings

## Supported services

Sonarr, Radarr, Lidarr, SABnzbd, qBittorrent, Seerr, Prowlarr

## Connection modes

| Mode | When to use |
| --- | --- |
| **Proxy** (default) | Self-host Dasharr. Avoids CORS via `/api/proxy`. |
| **Direct** | Static hosting only; each service must allow browser CORS. |

## Develop

```bash
npm install
npm run dev
```

- Web UI: http://localhost:5173
- Proxy API: http://127.0.0.1:8787

## Production

```bash
npm run build && npm start
```

Or Docker — see `Dockerfile`. Set `PROXY_SECRET` if exposing beyond LAN.

**Secure context:** the vault needs Web Crypto, so open Dasharr on `https://` or `http://localhost`. Plain `http://192.168.x.x` will block encryption (and passkeys).

**PWA:** production builds register a service worker for installable standalone use.

### CI image (linux/amd64)

On `main` / `v*` tags, `.github/workflows/docker.yml` builds **linux/amd64** and pushes to:

- **GHCR:** `ghcr.io/<owner>/dasharr-web:latest`
- **Docker Hub:** `<dockerhub-user>/dasharr-web:latest` (when secrets are set)

Add these repo secrets for Docker Hub:

| Secret | Value |
| --- | --- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Access token from [Docker Hub](https://hub.docker.com/settings/security) |

```bash
docker pull <dockerhub-user>/dasharr-web:latest
# or
docker pull ghcr.io/<owner>/dasharr-web:latest
```
