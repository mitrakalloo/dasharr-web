import { joinUrl } from '@/lib/format'
import { effectiveServiceUrl, type AppSettings, type ServiceConfig } from '@/types/config'

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

  if (
    service.type === 'qbittorrent' ||
    service.type === 'transmission' ||
    service.type === 'nzbget' ||
    service.type === 'deluge'
  ) {
    return headers
  }

  if (service.apiKey) {
    if (service.type === 'sabnzbd' || service.type === 'tautulli') {
      // API key is passed as a query param by the service module
    } else if (service.type === 'bazarr') {
      headers['X-API-KEY'] = service.apiKey
    } else if (service.type === 'unraid') {
      headers.Authorization = `Bearer ${service.apiKey}`
      headers['Content-Type'] = 'application/json'
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

async function serviceFetchRaw(
  settings: AppSettings,
  service: ServiceConfig,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  let url = joinUrl(effectiveServiceUrl(service), path)

  if (service.type === 'sabnzbd' && service.apiKey) {
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}apikey=${encodeURIComponent(service.apiKey)}`
  }

  const headers = mergeHeaders(authHeaders(service), init.headers)
  const method = init.method ?? 'GET'

  if (settings.connectionMode === 'direct') {
    return fetch(url, {
      ...init,
      method,
      headers,
      credentials:
        service.type === 'qbittorrent' || service.type === 'deluge' ? 'include' : 'omit',
    })
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

  return fetch(settings.proxyUrl || '/api/proxy', {
    method: 'POST',
    headers: proxyHeaders,
    body: JSON.stringify(payload),
  })
}

export async function serviceFetch(
  settings: AppSettings,
  service: ServiceConfig,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const response = await serviceFetchRaw(settings, service, path, init)
  if (!response.ok) {
    throw new ServiceRequestError(await parseError(response), response.status)
  }
  return response
}

/** Like serviceFetch but returns non-2xx responses (e.g. Transmission 409 session). */
export async function serviceFetchUnchecked(
  settings: AppSettings,
  service: ServiceConfig,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return serviceFetchRaw(settings, service, path, init)
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
