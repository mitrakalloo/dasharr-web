import { Hono } from 'hono'

import { db } from '../db/client'
import { service } from '../db/schema'
import { forwardUpstream } from '../lib/forwardUpstream'
import { decryptSecrets } from '../lib/secrets'
import type { AppVariables } from '../middleware/session'
import { requireSession } from '../middleware/session'

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
  unraid: '/api/graphql',
}

export const healthRoutes = new Hono<{ Variables: AppVariables }>()

healthRoutes.use('*', requireSession)

/** Parallel health check for all enabled services (one round-trip for the UI). */
healthRoutes.get('/', async (c) => {
  const user = c.get('user')
  const rows = await db.select().from(service)
  const enabled = rows.filter((row) => row.enabled)

  const results = await Promise.all(
    enabled.map(async (row) => {
      const path = STATUS_PATH[row.type]
      if (!path) {
        return {
          id: row.id,
          type: row.type,
          name: row.name,
          status: 'error' as const,
          error: 'Unsupported type',
        }
      }
      try {
        const method =
          row.type === 'nzbget' || row.type === 'deluge' || row.type === 'transmission'
            ? 'POST'
            : 'GET'
        let body: string | undefined
        if (row.type === 'nzbget') {
          body = JSON.stringify({ method: 'version', params: [], id: 1 })
        } else if (row.type === 'deluge') {
          body = JSON.stringify({ method: 'web.connected', params: [], id: 1 })
        } else if (row.type === 'transmission') {
          body = JSON.stringify({ method: 'session-get' })
        }

        const upstream = await forwardUpstream({
          userId: user.id,
          row,
          secrets: decryptSecrets(row.secretsCiphertext, row.secretsNonce),
          path,
          method,
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body,
        })
        if (!upstream.ok) {
          return {
            id: row.id,
            type: row.type,
            name: row.name,
            status: 'error' as const,
            error: `HTTP ${upstream.status}`,
          }
        }
        const text = await upstream.text()
        let version = 'ok'
        try {
          const json = JSON.parse(text) as Record<string, unknown>
          version = String(json.version ?? json.bazarr_version ?? json.result ?? 'ok')
        } catch {
          version = text.replace(/^"|"$/g, '').slice(0, 40) || 'ok'
        }
        return {
          id: row.id,
          type: row.type,
          name: row.name,
          status: 'success' as const,
          version,
        }
      } catch (error) {
        return {
          id: row.id,
          type: row.type,
          name: row.name,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unreachable',
        }
      }
    }),
  )

  return c.json({ checkedAt: new Date().toISOString(), services: results })
})
