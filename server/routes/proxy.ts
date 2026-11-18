import { eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db/client'
import { service } from '../db/schema'
import { forwardUpstream } from '../lib/forwardUpstream'
import { rateLimit } from '../lib/rateLimit'
import { decryptSecrets } from '../lib/secrets'
import type { AppVariables } from '../middleware/session'
import { requireSession } from '../middleware/session'

type CallBody = {
  id?: string
  serviceId?: string
  path?: string
  method?: string
  headers?: Record<string, string>
  body?: string
}

export const proxyRoutes = new Hono<{ Variables: AppVariables }>()

proxyRoutes.use('*', requireSession)

proxyRoutes.post('/', async (c) => {
  const user = c.get('user')
  const limited = rateLimit(`proxy:${user.id}`, 2400, 60_000)
  if (!limited.ok) {
    return c.json({ error: 'Rate limited', retryAfterSec: limited.retryAfterSec }, 429)
  }

  const body = await c.req.json<CallBody>()
  if (!body.serviceId || !body.path) {
    return c.json({ error: 'serviceId and path are required' }, 400)
  }

  const rows = await db.select().from(service).where(eq(service.id, body.serviceId)).limit(1)
  const row = rows[0]
  if (!row || !row.enabled) return c.json({ error: 'Service not found' }, 404)

  try {
    return await forwardUpstream({
      userId: user.id,
      row,
      secrets: decryptSecrets(row.secretsCiphertext, row.secretsNonce),
      path: body.path,
      method: body.method,
      headers: body.headers,
      body: body.body,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upstream request failed'
    return c.json({ error: message }, 502)
  }
})

/** Multiplexed proxy — one HTTP round-trip for many service calls. */
proxyRoutes.post('/batch', async (c) => {
  const user = c.get('user')
  const limited = rateLimit(`proxy-batch:${user.id}`, 300, 60_000)
  if (!limited.ok) {
    return c.json({ error: 'Rate limited', retryAfterSec: limited.retryAfterSec }, 429)
  }

  const body = await c.req.json<{ calls?: CallBody[] }>()
  const calls = body.calls ?? []
  if (calls.length === 0) return c.json({ results: [] })
  if (calls.length > 40) return c.json({ error: 'Max 40 calls per batch' }, 400)

  const ids = [...new Set(calls.map((call) => call.serviceId).filter(Boolean))] as string[]
  const rows = await db.select().from(service).where(inArray(service.id, ids))
  const byId = new Map(rows.map((row) => [row.id, row]))

  const results = await Promise.all(
    calls.map(async (call, index) => {
      const id = call.id ?? String(index)
      if (!call.serviceId || !call.path) {
        return { id, status: 400, error: 'serviceId and path required' }
      }
      const row = byId.get(call.serviceId)
      if (!row || !row.enabled) {
        return { id, status: 404, error: 'Service not found' }
      }
      try {
        const upstream = await forwardUpstream({
          userId: user.id,
          row,
          secrets: decryptSecrets(row.secretsCiphertext, row.secretsNonce),
          path: call.path,
          method: call.method,
          headers: call.headers,
          body: call.body,
        })
        const text = await upstream.text()
        const contentType = upstream.headers.get('content-type')
        return {
          id,
          status: upstream.status,
          contentType,
          body: text,
        }
      } catch (error) {
        return {
          id,
          status: 502,
          error: error instanceof Error ? error.message : 'Upstream failed',
        }
      }
    }),
  )

  return c.json({ results })
})
