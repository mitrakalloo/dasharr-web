import type { Context, Next } from 'hono'

import { auth, type SessionUser } from '../auth'

export type AppVariables = {
  user: SessionUser
  sessionId: string
}

export async function requireSession(c: Context<{ Variables: AppVariables }>, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('user', session.user as SessionUser)
  c.set('sessionId', session.session.id)
  await next()
}

export async function requireAdmin(c: Context<{ Variables: AppVariables }>, next: Next) {
  const user = c.get('user')
  if (user.role !== 'admin') {
    return c.json({ error: 'Admin only' }, 403)
  }
  await next()
}
