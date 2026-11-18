import type { service } from '../db/schema'
import type { ServiceSecrets } from './secrets'
import { assertSafeServicePath, effectiveServiceUrl } from './serviceUrl'
import { upstreamAuthHeaders, withQueryApiKey } from './upstreamAuth'

type ServiceRow = typeof service.$inferSelect

const cookieJar = new Map<string, Map<string, string>>()

function jarKey(userId: string, serviceId: string) {
  return `${userId}:${serviceId}`
}

function storeCookies(key: string, setCookieHeaders: string[]) {
  if (setCookieHeaders.length === 0) return
  const jar = cookieJar.get(key) ?? new Map<string, string>()
  for (const header of setCookieHeaders) {
    const pair = header.split(';')[0]
    const eqIdx = pair.indexOf('=')
    if (eqIdx <= 0) continue
    jar.set(pair.slice(0, eqIdx).trim(), pair.slice(eqIdx + 1).trim())
  }
  cookieJar.set(key, jar)
}

export type ProxyCallInput = {
  userId: string
  row: ServiceRow
  secrets: ServiceSecrets
  path: string
  method?: string
  headers?: Record<string, string>
  body?: string
}

export async function forwardUpstream(input: ProxyCallInput): Promise<Response> {
  const safePath = assertSafeServicePath(input.path)
  const base = effectiveServiceUrl(input.row)
  const target = new URL(safePath, `${base}/`)
  if (target.origin !== new URL(base).origin) {
    throw new Error('Path escapes service origin')
  }

  withQueryApiKey(input.row.type, target, input.secrets)

  const method = (input.method ?? 'GET').toUpperCase()
  const headers = new Headers()
  for (const [key, value] of Object.entries(
    upstreamAuthHeaders(input.row.type, input.secrets, input.row.username),
  )) {
    headers.set(key, value)
  }

  // Download-client Basic auth (credentials never leave the server)
  if (
    (input.row.type === 'nzbget' || input.row.type === 'transmission') &&
    input.row.username
  ) {
    const token = Buffer.from(
      `${input.row.username}:${input.secrets.password ?? ''}`,
    ).toString('base64')
    headers.set('Authorization', `Basic ${token}`)
  }

  for (const [key, value] of Object.entries(input.headers ?? {})) {
    const lower = key.toLowerCase()
    if (
      [
        'host',
        'origin',
        'referer',
        'content-length',
        'cookie',
        'x-api-key',
        'authorization',
      ].includes(lower)
    ) {
      continue
    }
    if (value) headers.set(key, value)
  }

  let outboundBody = method === 'GET' || method === 'HEAD' ? undefined : input.body
  if (outboundBody && input.row.type === 'qbittorrent' && safePath.includes('/auth/login')) {
    const params = new URLSearchParams(outboundBody)
    params.set('username', input.row.username ?? '')
    params.set('password', input.secrets.password ?? '')
    outboundBody = params.toString()
  }
  if (outboundBody && input.row.type === 'deluge' && safePath === '/json') {
    try {
      const payload = JSON.parse(outboundBody) as {
        method?: string
        params?: unknown[]
      }
      if (payload.method === 'auth.login') {
        payload.params = [input.secrets.password ?? input.secrets.apiKey]
        outboundBody = JSON.stringify(payload)
      }
    } catch {
      // keep body
    }
  }

  // Unraid API-key auth must not carry WebGUI cookies — those force CSRF checks.
  const key = jarKey(input.userId, input.row.id)
  if (input.row.type === 'unraid') {
    cookieJar.delete(key)
  } else {
    const jar = cookieJar.get(key)
    if (jar && jar.size > 0) {
      headers.set(
        'Cookie',
        Array.from(jar.entries())
          .map(([name, value]) => `${name}=${value}`)
          .join('; '),
      )
    }
  }

  const upstream = await fetch(target, {
    method,
    headers,
    body: outboundBody,
    redirect: 'manual',
  })

  const setCookie =
    typeof upstream.headers.getSetCookie === 'function' ? upstream.headers.getSetCookie() : []
  storeCookies(key, setCookie)

  const responseHeaders = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) responseHeaders.set('content-type', contentType)
  const transmissionSession = upstream.headers.get('X-Transmission-Session-Id')
  if (transmissionSession) {
    responseHeaders.set('X-Transmission-Session-Id', transmissionSession)
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}
