import type { AppSettings, ServiceConfig } from '@/types/config'

export class ServiceRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ServiceRequestError'
    this.status = status
  }
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

/**
 * All live service traffic goes through the authenticated BFF.
 * API keys never leave the server.
 */
async function serviceFetchRaw(
  _settings: AppSettings,
  service: ServiceConfig,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!path.startsWith('/')) {
    throw new ServiceRequestError('Service path must be relative', 400)
  }

  const method = init.method ?? 'GET'
  const headers = mergeHeaders({}, init.headers)
  // Strip anything that could smuggle credentials from the browser
  delete headers['X-Api-Key']
  delete headers['x-api-key']
  delete headers['X-API-KEY']
  delete headers.Authorization
  delete headers.authorization

  const bodyValue =
    typeof init.body === 'string'
      ? init.body
      : init.body != null
        ? String(init.body)
        : undefined

  return fetch('/api/proxy', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: service.id,
      path,
      method,
      headers,
      body: bodyValue,
    }),
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
