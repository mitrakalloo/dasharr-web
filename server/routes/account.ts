import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { auth } from '../auth'
import { db } from '../db/client'
import { auditEvent, session } from '../db/schema'
import { writeAudit } from '../lib/audit'
import type { AppVariables } from '../middleware/session'
import { requireAdmin, requireSession } from '../middleware/session'

export const accountRoutes = new Hono<{ Variables: AppVariables }>()

accountRoutes.use('*', requireSession)

accountRoutes.post('/change-password', async (c) => {
  const body = await c.req.json<{ currentPassword?: string; newPassword?: string }>()
  if (!body.currentPassword || !body.newPassword) {
    return c.json({ error: 'currentPassword and newPassword are required' }, 400)
  }
  if (body.newPassword.length < 12) {
    return c.json({ error: 'Password must be at least 12 characters' }, 400)
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
        revokeOtherSessions: true,
      },
      headers: c.req.raw.headers,
    })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Could not change password' },
      400,
    )
  }

  await writeAudit({
    userId: c.get('user').id,
    action: 'account.password_change',
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  return c.json({ ok: true })
})

accountRoutes.get('/sessions', async (c) => {
  const userId = c.get('user').id
  const rows = await db
    .select({
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      token: session.token,
    })
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.updatedAt))

  const current = c.get('sessionId')
  return c.json({
    sessions: rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      current: row.id === current,
    })),
  })
})

accountRoutes.delete('/sessions/:id', async (c) => {
  const userId = c.get('user').id
  const id = c.req.param('id')
  if (id === c.get('sessionId')) {
    return c.json({ error: 'Cannot revoke the current session here — sign out instead' }, 400)
  }
  const deleted = await db
    .delete(session)
    .where(eq(session.id, id))
    .returning({ id: session.id, userId: session.userId })

  const row = deleted[0]
  if (!row || row.userId !== userId) return c.json({ error: 'Not found' }, 404)

  await writeAudit({
    userId,
    action: 'account.session_revoke',
    targetType: 'session',
    targetId: id,
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  return c.json({ ok: true })
})

accountRoutes.get('/audit', requireAdmin, async (c) => {
  const rows = await db
    .select()
    .from(auditEvent)
    .orderBy(desc(auditEvent.createdAt))
    .limit(100)
  return c.json({
    events: rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      meta: row.meta,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt.toISOString(),
    })),
  })
})
