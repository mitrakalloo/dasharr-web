import { joinUrl } from '@/lib/format'
import type { AppSettings, ServiceConfig } from '@/types/config'

export class ServiceRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ServiceRequestError'
    this.status = status
  }
}

interface ProxyPayload {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}

function authHeaders(service: ServiceConfig): Record<string, string> {
  const headers: Record<string, string> = {}

  if (service.type === 'qbittorrent') {
    return headers
  }

  if (service.apiKey) {
    if (service.type === 'sabnzbd') {
      // SABnzbd uses query param; header unused
    } else if (service.type === 'seerr') {
      headers['X-Api-Key'] = service.apiKey
    } else {
      headers['X-Api-Key'] = service.apiKey
    }
  }

  return headers
}

function mergeHeaders(
  base: Record<string, string>,
  extra?: HeadersInit,
): Record<string, string> {
  const result = { ...base }
  if (!extra) return result
  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
  if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      result[key] = value
    }
    return result
  }
  return { ...result, ...extra }
}

async function parseError(response: Response): Promise<string> {
  try {
    const text = await response.text()
    return text || response.statusText || `HTTP ${response.status}`
  } catch {
    return response.statusText || `HTTP ${response.status}`
  }
}

export async function serviceFetch(
  settings: AppSettings,
  service: ServiceConfig,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  let url = joinUrl(service.baseUrl, path)

  if (service.type === 'sabnzbd' && service.apiKey) {
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}apikey=${encodeURIComponent(service.apiKey)}`
  }

  const headers = mergeHeaders(authHeaders(service), init.headers)
  const method = init.method ?? 'GET'

  if (settings.connectionMode === 'direct') {
    const response = await fetch(url, {
      ...init,
      method,
      headers,
      credentials: service.type === 'qbittorrent' ? 'include' : 'omit',
    })
    if (!response.ok) {
      throw new ServiceRequestError(await parseError(response), response.status)
    }
    return response
  }

  const bodyValue =
    typeof init.body === 'string'
      ? init.body
      : init.body != null
        ? String(init.body)
        : undefined

  const payload: ProxyPayload = {
    url,
    method,
    headers,
    body: bodyValue,
  }

  const proxyHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (settings.proxySecret) {
    proxyHeaders['X-Proxy-Secret'] = settings.proxySecret
  }

  const proxyResponse = await fetch(settings.proxyUrl || '/api/proxy', {
    method: 'POST',
    headers: proxyHeaders,
    body: JSON.stringify(payload),
  })

  if (!proxyResponse.ok) {
    throw new ServiceRequestError(await parseError(proxyResponse), proxyResponse.status)
  }

  return proxyResponse
}

export async function serviceJson<T>(
  settings: AppSettings,
  service: ServiceConfig,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await serviceFetch(settings, service, path, init)
  return (await response.json()) as T
}
