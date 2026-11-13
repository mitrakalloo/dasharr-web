import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT ?? 8787)
const proxySecret = process.env.PROXY_SECRET ?? ''

interface ProxyBody {
  url?: string
  method?: string
  headers?: Record<string, string>
  body?: string
}

/** In-memory cookie jar so qBittorrent sessions work through the proxy. */
const cookieJar = new Map<string, Map<string, string>>()

function storeCookies(origin: string, setCookieHeaders: string[]) {
  if (setCookieHeaders.length === 0) return
  const jar = cookieJar.get(origin) ?? new Map<string, string>()
  for (const header of setCookieHeaders) {
    const pair = header.split(';')[0]
    const eq = pair.indexOf('=')
    if (eq <= 0) continue
    const name = pair.slice(0, eq).trim()
    const value = pair.slice(eq + 1).trim()
    if (name) jar.set(name, value)
  }
  cookieJar.set(origin, jar)
}

function cookieHeaderFor(origin: string): string | undefined {
  const jar = cookieJar.get(origin)
  if (!jar || jar.size === 0) return undefined
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Proxy-Secret'],
  }),
)

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    mode: isProd ? 'production' : 'development',
    proxyAuthRequired: Boolean(proxySecret),
  }),
)

app.post('/api/proxy', async (c) => {
  if (proxySecret) {
    const provided = c.req.header('X-Proxy-Secret')
    if (provided !== proxySecret) {
      return c.json({ error: 'Invalid proxy secret' }, 401)
    }
  }

  let payload: ProxyBody
  try {
    payload = await c.req.json<ProxyBody>()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (!payload.url || typeof payload.url !== 'string') {
    return c.json({ error: 'Missing url' }, 400)
  }

  let target: URL
  try {
    target = new URL(payload.url)
  } catch {
    return c.json({ error: 'Invalid url' }, 400)
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return c.json({ error: 'Only http/https URLs are allowed' }, 400)
  }

  const method = (payload.method ?? 'GET').toUpperCase()
  const headers = new Headers()
  for (const [key, value] of Object.entries(payload.headers ?? {})) {
    if (!value) continue
    const lower = key.toLowerCase()
    if (['host', 'origin', 'referer', 'content-length', 'cookie'].includes(lower)) continue
    headers.set(key, value)
  }

  const jarCookies = cookieHeaderFor(target.origin)
  if (jarCookies) headers.set('Cookie', jarCookies)

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : payload.body,
      redirect: 'manual',
    })

    const setCookie =
      typeof upstream.headers.getSetCookie === 'function'
        ? upstream.headers.getSetCookie()
        : []
    storeCookies(target.origin, setCookie)

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

if (isProd) {
  const distDir = path.resolve(__dirname, '../dist')
  app.use('/*', serveStatic({ root: distDir }))
  app.get('*', async (c) => {
    const html = await readFile(path.join(distDir, 'index.html'), 'utf8')
    return c.html(html)
  })
}

console.log(`Dasharr API listening on http://127.0.0.1:${port}`)
serve({ fetch: app.fetch, port })
