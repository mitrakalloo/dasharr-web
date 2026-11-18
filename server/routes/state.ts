import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'

import { db } from '../db/client'
import { dashboardState, prefsState } from '../db/schema'
import { publishState, subscribeState } from '../lib/stateBus'
import type { AppVariables } from '../middleware/session'
import { requireSession } from '../middleware/session'

const HOUSEHOLD_DASHBOARD_ID = 'default'

function prefsIdFor(userId: string) {
  return `user:${userId}`
}

export const stateRoutes = new Hono<{ Variables: AppVariables }>()

stateRoutes.use('*', requireSession)

stateRoutes.get('/prefs', async (c) => {
  const userId = c.get('user').id
  const rows = await db
    .select()
    .from(prefsState)
    .where(eq(prefsState.id, prefsIdFor(userId)))
    .limit(1)
  const row = rows[0]
  if (!row) {
    // Migrate once from legacy household prefs row
    const legacy = await db
      .select()
      .from(prefsState)
      .where(eq(prefsState.id, 'default'))
      .limit(1)
    if (legacy[0]) {
      return c.json({
        prefs: JSON.parse(legacy[0].payload) as unknown,
        updatedAt: legacy[0].updatedAt.toISOString(),
        scope: 'user',
      })
    }
    return c.json({ prefs: null, updatedAt: null, scope: 'user' })
  }
  return c.json({
    prefs: JSON.parse(row.payload) as unknown,
    updatedAt: row.updatedAt.toISOString(),
    scope: 'user',
  })
})

stateRoutes.put('/prefs', async (c) => {
  const body = await c.req.json<{ prefs?: unknown }>()
  if (!body.prefs || typeof body.prefs !== 'object') {
    return c.json({ error: 'prefs object required' }, 400)
  }
  const userId = c.get('user').id
  const payload = JSON.stringify(body.prefs)
  const now = new Date()
  const id = prefsIdFor(userId)

  await db
    .insert(prefsState)
    .values({
      id,
      payload,
      updatedAt: now,
      updatedByUserId: userId,
    })
    .onConflictDoUpdate({
      target: prefsState.id,
      set: {
        payload,
        updatedAt: now,
        updatedByUserId: userId,
      },
    })

  publishState({ type: 'prefs', userId })
  return c.json({ ok: true, updatedAt: now.toISOString() })
})

stateRoutes.get('/dashboard', async (c) => {
  const rows = await db
    .select()
    .from(dashboardState)
    .where(eq(dashboardState.id, HOUSEHOLD_DASHBOARD_ID))
    .limit(1)
  const row = rows[0]
  if (!row) return c.json({ dashboard: null, updatedAt: null, scope: 'household' })
  return c.json({
    dashboard: JSON.parse(row.payload) as unknown,
    updatedAt: row.updatedAt.toISOString(),
    scope: 'household',
  })
})

stateRoutes.put('/dashboard', async (c) => {
  const body = await c.req.json<{ dashboard?: unknown }>()
  if (!body.dashboard || typeof body.dashboard !== 'object') {
    return c.json({ error: 'dashboard object required' }, 400)
  }
  const payload = JSON.stringify(body.dashboard)
  const userId = c.get('user').id
  const now = new Date()

  await db
    .insert(dashboardState)
    .values({
      id: HOUSEHOLD_DASHBOARD_ID,
      payload,
      updatedAt: now,
      updatedByUserId: userId,
    })
    .onConflictDoUpdate({
      target: dashboardState.id,
      set: {
        payload,
        updatedAt: now,
        updatedByUserId: userId,
      },
    })

  publishState({ type: 'dashboard' })
  return c.json({ ok: true, updatedAt: now.toISOString() })
})

/** Live sync — other devices rehydrate when household/user state changes. */
stateRoutes.get('/events', async (c) => {
  const userId = c.get('user').id
  return streamSSE(c, async (stream) => {
    let active = true
    stream.onAbort(() => {
      active = false
    })
    await stream.writeSSE({ event: 'ready', data: JSON.stringify({ ok: true }) })
    const unsubscribe = subscribeState((event) => {
      if (!active) return
      if (event.type === 'prefs' && event.userId && event.userId !== userId) return
      void stream.writeSSE({
        event: event.type,
        data: JSON.stringify({ at: Date.now() }),
      })
    })
    while (active) {
      await stream.writeSSE({ event: 'ping', data: String(Date.now()) })
      await stream.sleep(25_000)
    }
    unsubscribe()
  })
})
