import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db/client'
import { dashboardState, prefsState } from '../db/schema'
import type { AppVariables } from '../middleware/session'
import { requireSession } from '../middleware/session'

const HOUSEHOLD_ID = 'default'

export const stateRoutes = new Hono<{ Variables: AppVariables }>()

stateRoutes.use('*', requireSession)

stateRoutes.get('/prefs', async (c) => {
  const rows = await db
    .select()
    .from(prefsState)
    .where(eq(prefsState.id, HOUSEHOLD_ID))
    .limit(1)
  const row = rows[0]
  if (!row) return c.json({ prefs: null, updatedAt: null })
  return c.json({
    prefs: JSON.parse(row.payload) as unknown,
    updatedAt: row.updatedAt.toISOString(),
  })
})

stateRoutes.put('/prefs', async (c) => {
  const body = await c.req.json<{ prefs?: unknown }>()
  if (!body.prefs || typeof body.prefs !== 'object') {
    return c.json({ error: 'prefs object required' }, 400)
  }
  const payload = JSON.stringify(body.prefs)
  const userId = c.get('user').id
  const now = new Date()

  await db
    .insert(prefsState)
    .values({
      id: HOUSEHOLD_ID,
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

  return c.json({ ok: true, updatedAt: now.toISOString() })
})

stateRoutes.get('/dashboard', async (c) => {
  const rows = await db
    .select()
    .from(dashboardState)
    .where(eq(dashboardState.id, HOUSEHOLD_ID))
    .limit(1)
  const row = rows[0]
  if (!row) return c.json({ dashboard: null, updatedAt: null })
  return c.json({
    dashboard: JSON.parse(row.payload) as unknown,
    updatedAt: row.updatedAt.toISOString(),
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
      id: HOUSEHOLD_ID,
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

  return c.json({ ok: true, updatedAt: now.toISOString() })
})
