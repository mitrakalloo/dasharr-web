import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'

import type { AppVariables } from '../middleware/session'
import { requireSession } from '../middleware/session'
import { db } from '../db/client'
import { service } from '../db/schema'
import { writeAudit } from '../lib/audit'
import { decryptSecrets, encryptSecrets } from '../lib/secrets'
import { probeRoutes } from './probe'

export type PublicService = {
  id: string
  type: string
  name: string
  baseUrl: string
  localUrl?: string
  remoteUrl?: string
  urlMode: string
  enabled: boolean
  username?: string
  hasApiKey: boolean
  hasPassword: boolean
}

function toPublic(
  row: typeof service.$inferSelect,
  secrets: { apiKey: string; password?: string },
): PublicService {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    baseUrl: row.baseUrl,
    localUrl: row.localUrl ?? undefined,
    remoteUrl: row.remoteUrl ?? undefined,
    urlMode: row.urlMode,
    enabled: row.enabled,
    username: row.username ?? undefined,
    hasApiKey: Boolean(secrets.apiKey),
    hasPassword: Boolean(secrets.password),
  }
}

export const serviceRoutes = new Hono<{ Variables: AppVariables }>()

serviceRoutes.use('*', requireSession)
serviceRoutes.route('/probe', probeRoutes)

serviceRoutes.get('/', async (c) => {
  const rows = await db.select().from(service)
  const items = rows.map((row) => {
    const secrets = decryptSecrets(row.secretsCiphertext, row.secretsNonce)
    return toPublic(row, secrets)
  })
  return c.json({ services: items })
})

serviceRoutes.post('/', async (c) => {
  const body = await c.req.json<{
    type: string
    name: string
    baseUrl: string
    localUrl?: string
    remoteUrl?: string
    urlMode?: string
    enabled?: boolean
    username?: string
    apiKey?: string
    password?: string
  }>()

  if (!body.type || !body.name || !body.baseUrl) {
    return c.json({ error: 'type, name, and baseUrl are required' }, 400)
  }

  const encrypted = encryptSecrets({
    apiKey: body.apiKey ?? '',
    password: body.password,
  })
  const id = randomUUID()
  const [row] = await db
    .insert(service)
    .values({
      id,
      type: body.type,
      name: body.name,
      baseUrl: body.baseUrl.replace(/\/+$/, ''),
      localUrl: body.localUrl?.replace(/\/+$/, '') || null,
      remoteUrl: body.remoteUrl?.replace(/\/+$/, '') || null,
      urlMode: body.urlMode ?? 'auto',
      enabled: body.enabled ?? true,
      username: body.username || null,
      secretsCiphertext: encrypted.ciphertext,
      secretsNonce: encrypted.nonce,
    })
    .returning()

  await writeAudit({
    userId: c.get('user').id,
    action: 'service.create',
    targetType: 'service',
    targetId: id,
    meta: { type: body.type, name: body.name },
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  const secrets = decryptSecrets(row.secretsCiphertext, row.secretsNonce)
  return c.json({ service: toPublic(row, secrets) }, 201)
})

serviceRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const existing = await db.select().from(service).where(eq(service.id, id)).limit(1)
  const row = existing[0]
  if (!row) return c.json({ error: 'Not found' }, 404)

  const body = await c.req.json<{
    name?: string
    baseUrl?: string
    localUrl?: string | null
    remoteUrl?: string | null
    urlMode?: string
    enabled?: boolean
    username?: string | null
    apiKey?: string
    password?: string
  }>()

  const currentSecrets = decryptSecrets(row.secretsCiphertext, row.secretsNonce)
  const nextSecrets = {
    apiKey: body.apiKey !== undefined ? body.apiKey : currentSecrets.apiKey,
    password: body.password !== undefined ? body.password : currentSecrets.password,
  }
  const encrypted = encryptSecrets(nextSecrets)

  const [updated] = await db
    .update(service)
    .set({
      name: body.name ?? row.name,
      baseUrl: body.baseUrl?.replace(/\/+$/, '') ?? row.baseUrl,
      localUrl:
        body.localUrl === undefined
          ? row.localUrl
          : body.localUrl
            ? body.localUrl.replace(/\/+$/, '')
            : null,
      remoteUrl:
        body.remoteUrl === undefined
          ? row.remoteUrl
          : body.remoteUrl
            ? body.remoteUrl.replace(/\/+$/, '')
            : null,
      urlMode: body.urlMode ?? row.urlMode,
      enabled: body.enabled ?? row.enabled,
      username: body.username === undefined ? row.username : body.username,
      secretsCiphertext: encrypted.ciphertext,
      secretsNonce: encrypted.nonce,
      updatedAt: new Date(),
    })
    .where(eq(service.id, id))
    .returning()

  await writeAudit({
    userId: c.get('user').id,
    action: 'service.update',
    targetType: 'service',
    targetId: id,
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  return c.json({
    service: toPublic(updated, decryptSecrets(updated.secretsCiphertext, updated.secretsNonce)),
  })
})

serviceRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deleted = await db.delete(service).where(eq(service.id, id)).returning()
  if (deleted.length === 0) return c.json({ error: 'Not found' }, 404)

  await writeAudit({
    userId: c.get('user').id,
    action: 'service.delete',
    targetType: 'service',
    targetId: id,
    ipAddress: c.req.header('x-forwarded-for') ?? null,
  })

  return c.json({ ok: true })
})
