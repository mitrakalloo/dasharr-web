import 'dotenv/config'

import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { auth } from './auth'
import { getAppEnv, getTrustedOrigins } from './lib/env'
import { inviteRoutes } from './routes/invites'
import { proxyRoutes } from './routes/proxy'
import { serviceRoutes } from './routes/services'
import { setupRoutes } from './routes/setup'
import { stateRoutes } from './routes/state'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const env = getAppEnv()

const app = new Hono()

app.use('*', secureHeaders())

app.use(
  '/api/*',
  cors({
    origin: getTrustedOrigins(),
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true,
  }),
)

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    mode: env.isProd ? 'production' : 'development',
    auth: true,
  }),
)

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

app.route('/api/setup', setupRoutes)
app.route('/api/invites', inviteRoutes)
app.route('/api/services', serviceRoutes)
app.route('/api/state', stateRoutes)
app.route('/api/proxy', proxyRoutes)

/** Legacy open proxy is intentionally removed. */

if (env.isProd) {
  const distDir = path.resolve(__dirname, '../dist')
  app.use('/*', serveStatic({ root: distDir }))
  app.get('*', async (c) => {
    const html = await readFile(path.join(distDir, 'index.html'), 'utf8')
    return c.html(html)
  })
}

console.log(`Dasharr API listening on http://127.0.0.1:${env.port}`)
serve({ fetch: app.fetch, port: env.port })
