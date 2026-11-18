import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

import type { AppVariables } from '../middleware/session'
import { requireSession } from '../middleware/session'
import { db } from '../db/client'
import { service } from '../db/schema'
import { rateLimit } from '../lib/rateLimit'
import { decryptSecrets } from '../lib/secrets'
import { assertSafeServicePath, effectiveServiceUrl } from '../lib/serviceUrl'
import { upstreamAuthHeaders, withQueryApiKey } from '../lib/upstreamAuth'

/** In-memory cookie jar keyed by user+service for download-client sessions. */
const cookieJar = new Map<string, Map<string, string>>()

function jarKey(userId: string, serviceId: string) {
  return `${userId}:${serviceId}`
}

function storeCookies(key: string, setCookieHeaders: string[]) {
  if (setCookieHeaders.length === 0) return
  const jar = cookieJar.get(key) ?? new Map<string, string>()
  for (const header of setCookieHeaders) {
    const pair = header.split(';')[0]
    const eqIdx = pair.indexOf('=')
    if (eqIdx <= 0) continue
    jar.set(pair.slice(0, eqIdx).trim(), pair.slice(eqIdx + 1).trim())
  }
  cookieJar.set(key, jar)
}

export const proxyRoutes = new Hono<{ Variables: AppVariables }>()

proxyRoutes.use('*', requireSession)

/**
 * Authenticated BFF proxy.
 * Client sends serviceId + relative path — never absolute URLs or API keys.
 */
proxyRoutes.post('/', async (c) => {
  const user = c.get('user')
  const limited = rateLimit(`proxy:${user.id}`, 120, 60_000)
  if (!limited.ok) {
    return c.json({ error: 'Rate limited', retryAfterSec: limited.retryAfterSec }, 429)
  }

  const body = await c.req.json<{
    serviceId?: string
    path?: string
    method?: string
    headers?: Record<string, string>
    body?: string
  }>()

  if (!body.serviceId || !body.path) {
    return c.json({ error: 'serviceId and path are required' }, 400)
  }

  let safePath: string
  try {
    safePath = assertSafeServicePath(body.path)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid path' }, 400)
  }

  const rows = await db.select().from(service).where(eq(service.id, body.serviceId)).limit(1)
  const row = rows[0]
  if (!row || !row.enabled) return c.json({ error: 'Service not found' }, 404)

  const secrets = decryptSecrets(row.secretsCiphertext, row.secretsNonce)
  const base = effectiveServiceUrl(row)
  const target = new URL(safePath, `${base}/`)
  if (target.origin !== new URL(base).origin) {
    return c.json({ error: 'Path escapes service origin' }, 400)
  }

  withQueryApiKey(row.type, target, secrets)

  const method = (body.method ?? 'GET').toUpperCase()
  const headers = new Headers()
  for (const [key, value] of Object.entries(upstreamAuthHeaders(row.type, secrets, row.username))) {
    headers.set(key, value)
  }
  for (const [key, value] of Object.entries(body.headers ?? {})) {
    const lower = key.toLowerCase()
    if (
      ['host', 'origin', 'referer', 'content-length', 'cookie', 'x-api-key', 'authorization'].includes(
        lower,
      )
    ) {
      continue
    }
    if (value) headers.set(key, value)
  }

  let outboundBody = method === 'GET' || method === 'HEAD' ? undefined : body.body
  // Inject download-client credentials server-side (never present in the browser).
  if (outboundBody && row.type === 'qbittorrent' && safePath.includes('/auth/login')) {
    const params = new URLSearchParams(outboundBody)
    params.set('username', row.username ?? '')
    params.set('password', secrets.password ?? '')
    outboundBody = params.toString()
  }
  if (outboundBody && row.type === 'deluge' && safePath === '/json') {
    try {
      const payload = JSON.parse(outboundBody) as {
        method?: string
        params?: unknown[]
        id?: number
      }
      if (payload.method === 'auth.login') {
        payload.params = [secrets.password ?? secrets.apiKey]
        outboundBody = JSON.stringify(payload)
      }
    } catch {
      // leave body unchanged
    }
  }
  if (outboundBody && (row.type === 'nzbget' || row.type === 'transmission')) {
    // Basic auth for NZBGet; Transmission session handled via headers/cookies.
    if (row.type === 'nzbget' && row.username) {
      const token = Buffer.from(`${row.username}:${secrets.password ?? ''}`).toString('base64')
      headers.set('Authorization', `Basic ${token}`)
    }
  }

  const key = jarKey(user.id, row.id)
  const jar = cookieJar.get(key)
  if (jar && jar.size > 0) {
    headers.set(
      'Cookie',
      Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; '),
    )
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body: outboundBody,
      redirect: 'manual',
    })

    const setCookie =
      typeof upstream.headers.getSetCookie === 'function' ? upstream.headers.getSetCookie() : []
    storeCookies(key, setCookie)

    const responseHeaders = new Headers()
    const contentType = upstream.headers.get('content-type')
    if (contentType) responseHeaders.set('content-type', contentType)

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upstream request failed'
    return c.json({ error: message }, 502)
  }
})
