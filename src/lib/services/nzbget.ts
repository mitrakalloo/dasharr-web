import { serviceFetch } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface NzbgetGroup {
  NZBID: number
  NZBName: string
  Status: string
  FileSizeMB: number
  RemainingSizeMB: number
  DownloadRate: number
}

async function nzbRpc(
  settings: AppSettings,
  service: ServiceConfig,
  method: string,
  params: unknown[] = [],
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (service.username || service.password) {
    headers.Authorization = `Basic ${btoa(`${service.username ?? ''}:${service.password ?? ''}`)}`
  }
  const response = await serviceFetch(settings, service, '/jsonrpc', {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  })
  if (!response.ok) throw new Error(`NZBGet error (${response.status})`)
  const payload = (await response.json()) as { result?: unknown; error?: { message?: string } }
  if (payload.error) throw new Error(payload.error.message ?? 'NZBGet failed')
  return payload.result
}

export async function getNzbgetGroups(settings: AppSettings, service: ServiceConfig) {
  return (await nzbRpc(settings, service, 'listgroups')) as NzbgetGroup[]
}

export async function getNzbgetVersion(settings: AppSettings, service: ServiceConfig) {
  const version = await nzbRpc(settings, service, 'version')
  return String(version)
}

export async function nzbgetPause(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  await nzbRpc(settings, service, 'editqueue', ['GroupPause', 0, '', [id]])
}

export async function nzbgetResume(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  await nzbRpc(settings, service, 'editqueue', ['GroupResume', 0, '', [id]])
}

export async function nzbgetDelete(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  await nzbRpc(settings, service, 'editqueue', ['GroupDelete', 0, '', [id]])
}
