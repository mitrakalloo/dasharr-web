import { Hono } from 'hono'

import type { AppVariables } from '../middleware/session'
import { requireSession } from '../middleware/session'
import { rateLimit } from '../lib/rateLimit'
import { effectiveServiceUrl } from '../lib/serviceUrl'
import { upstreamAuthHeaders, withQueryApiKey } from '../lib/upstreamAuth'

const STATUS_PATH: Record<string, string> = {
  sonarr: '/api/v3/system/status',
  radarr: '/api/v3/system/status',
  lidarr: '/api/v1/system/status',
  readarr: '/api/v1/system/status',
  whisparr: '/api/v3/system/status',
  prowlarr: '/api/v1/system/status',
  seerr: '/api/v1/status',
  sabnzbd: '/api?mode=version&output=json',
  tautulli: '/api/v2?cmd=get_server_info',
  bazarr: '/api/system/status',
  qbittorrent: '/api/v2/app/version',
  transmission: '/transmission/rpc',
  nzbget: '/jsonrpc',
  deluge: '/json',
  unraid: '/graphql',
}

export const probeRoutes = new Hono<{ Variables: AppVariables }>()

probeRoutes.use('*', requireSession)

/** Ephemeral connectivity test — credentials are not stored. */
probeRoutes.post('/', async (c) => {
  const user = c.get('user')
  const limited = rateLimit(`probe:${user.id}`, 30, 60_000)
  if (!limited.ok) return c.json({ error: 'Rate limited' }, 429)

  const body = await c.req.json<{
    type?: string
    baseUrl?: string
    localUrl?: string
    remoteUrl?: string
    urlMode?: string
    apiKey?: string
    username?: string
    password?: string
  }>()

  if (!body.type || !body.baseUrl) {
    return c.json({ error: 'type and baseUrl are required' }, 400)
  }

  const path = STATUS_PATH[body.type]
  if (!path) return c.json({ error: `Probe not supported for ${body.type}` }, 400)

  const base = effectiveServiceUrl({
    baseUrl: body.baseUrl,
    localUrl: body.localUrl,
    remoteUrl: body.remoteUrl,
    urlMode: body.urlMode,
  })
  const target = new URL(path, `${base}/`)
  const secrets = { apiKey: body.apiKey ?? '', password: body.password }
  withQueryApiKey(body.type, target, secrets)

  const headers = new Headers(upstreamAuthHeaders(body.type, secrets, body.username))

  try {
    if (body.type === 'unraid') {
      headers.set('Content-Type', 'application/json')
    }
    const upstream = await fetch(target, {
      method:
        body.type === 'nzbget' || body.type === 'deluge' || body.type === 'unraid'
          ? 'POST'
          : 'GET',
      headers,
      body:
        body.type === 'nzbget'
          ? JSON.stringify({ method: 'version', params: [], id: 1 })
          : body.type === 'deluge'
            ? JSON.stringify({ method: 'web.connected', params: [], id: 1 })
            : body.type === 'unraid'
              ? JSON.stringify({ query: '{ online }' })
              : undefined,
    })
    if (!upstream.ok) {
      return c.json({ error: `Upstream HTTP ${upstream.status}` }, 502)
    }
    const text = await upstream.text()
    let version = 'ok'
    try {
      const json = JSON.parse(text) as Record<string, unknown>
      if (body.type === 'unraid') {
        const errors = json.errors as Array<{ message?: string }> | undefined
        if (errors?.length) {
          return c.json({ error: errors[0]?.message ?? 'Unraid GraphQL error' }, 502)
        }
        const data = json.data as { online?: boolean } | undefined
        version = data?.online === false ? 'offline' : 'ok'
      } else {
        version = String(json.version ?? json.bazarr_version ?? json.result ?? 'ok')
      }
    } catch {
      version = text.replace(/^"|"$/g, '').slice(0, 40) || 'ok'
    }
    return c.json({ version })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Probe failed' },
      502,
    )
  }
})
