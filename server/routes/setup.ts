import { count } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db/client'
import { user } from '../db/schema'
import { writeAudit } from '../lib/audit'
import { getAppEnv } from '../lib/env'
import { createCredentialUser } from '../lib/createUser'
import { rateLimit } from '../lib/rateLimit'

export const setupRoutes = new Hono()

setupRoutes.get('/status', async (c) => {
  const [{ value }] = await db.select({ value: count() }).from(user)
  return c.json({
    needsSetup: Number(value) === 0,
    authMode: 'account',
  })
})

setupRoutes.post('/bootstrap', async (c) => {
  const limited = rateLimit(`setup:${c.req.header('x-forwarded-for') ?? 'local'}`, 5, 60_000)
  if (!limited.ok) {
    return c.json({ error: 'Too many attempts' }, 429)
  }

  const [{ value }] = await db.select({ value: count() }).from(user)
  if (Number(value) > 0) {
    return c.json({ error: 'Already initialized' }, 409)
  }

  const body = await c.req.json<{
    setupToken?: string
    email?: string
    password?: string
    name?: string
  }>()

  if (!body.setupToken || body.setupToken !== getAppEnv().setupToken) {
    return c.json({ error: 'Invalid setup token' }, 401)
  }
  if (!body.email || !body.password || !body.name) {
    return c.json({ error: 'email, password, and name are required' }, 400)
  }
  if (body.password.length < 12) {
    return c.json({ error: 'Password must be at least 12 characters' }, 400)
  }

  const created = await createCredentialUser({
    email: body.email,
    password: body.password,
    name: body.name,
    role: 'admin',
  })

  await writeAudit({
    userId: created.id,
    action: 'bootstrap.admin',
    targetType: 'user',
    targetId: created.id,
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  return c.json({ ok: true, userId: created.id })
})
