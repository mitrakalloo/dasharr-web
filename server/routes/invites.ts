import { and, eq, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { randomBytes, randomUUID } from 'node:crypto'

import type { AppVariables } from '../middleware/session'
import { requireAdmin, requireSession } from '../middleware/session'
import { db } from '../db/client'
import { invite } from '../db/schema'
import { writeAudit } from '../lib/audit'
import { createCredentialUser } from '../lib/createUser'
import { hashToken } from '../lib/secrets'
import { rateLimit } from '../lib/rateLimit'

export const inviteRoutes = new Hono<{ Variables: AppVariables }>()

inviteRoutes.post('/', requireSession, requireAdmin, async (c) => {
  const body = await c.req.json<{ email?: string; expiresInHours?: number }>()
  const token = randomBytes(24).toString('base64url')
  const hours = Math.min(Math.max(body.expiresInHours ?? 72, 1), 168)
  const id = randomUUID()
  const user = c.get('user')

  await db.insert(invite).values({
    id,
    tokenHash: hashToken(token),
    email: body.email?.toLowerCase().trim() || null,
    createdByUserId: user.id,
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
  })

  await writeAudit({
    userId: user.id,
    action: 'invite.create',
    targetType: 'invite',
    targetId: id,
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  return c.json({
    id,
    token,
    expiresInHours: hours,
    // Show once — store hash only
  })
})

inviteRoutes.post('/redeem', async (c) => {
  const limited = rateLimit(`invite:${c.req.header('x-forwarded-for') ?? 'local'}`, 10, 60_000)
  if (!limited.ok) return c.json({ error: 'Too many attempts' }, 429)

  const body = await c.req.json<{
    token?: string
    email?: string
    password?: string
    name?: string
  }>()

  if (!body.token || !body.email || !body.password || !body.name) {
    return c.json({ error: 'token, email, password, and name are required' }, 400)
  }
  if (body.password.length < 12) {
    return c.json({ error: 'Password must be at least 12 characters' }, 400)
  }

  const rows = await db
    .select()
    .from(invite)
    .where(and(eq(invite.tokenHash, hashToken(body.token)), isNull(invite.usedAt)))
    .limit(1)

  const row = rows[0]
  if (!row || row.expiresAt.getTime() < Date.now()) {
    return c.json({ error: 'Invalid or expired invite' }, 400)
  }
  if (row.email && row.email !== body.email.toLowerCase().trim()) {
    return c.json({ error: 'Invite is locked to a different email' }, 400)
  }

  const created = await createCredentialUser({
    email: body.email,
    password: body.password,
    name: body.name,
    role: 'member',
  })

  await db
    .update(invite)
    .set({ usedAt: new Date(), usedByUserId: created.id })
    .where(eq(invite.id, row.id))

  await writeAudit({
    userId: created.id,
    action: 'invite.redeem',
    targetType: 'invite',
    targetId: row.id,
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  return c.json({ ok: true, userId: created.id })
})
