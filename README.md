# Dasharr Web

Mobile-first companion dashboard for your *arr stack — inspired by [Dasharr](../dasharr) and [nzb360](https://nzb360.com/). Configs live in `localStorage` (no accounts, no DB).

## UI

- Sticky top bar with health pill + add media
- Bottom tabs: **Overview · Queue · Calendar · Search**
- Slide-up bottom sheets for details / manual search
- OLED dark theme with *arr accent badges
- Desktop centers a `480px` phone shell on a dark backdrop

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
