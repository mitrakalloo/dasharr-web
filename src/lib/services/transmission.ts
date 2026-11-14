import { serviceFetchUnchecked } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface TransmissionTorrent {
  id: number
  name: string
  status: number
  percentDone: number
  rateDownload: number
  eta: number
  totalSize: number
  hashString: string
}

let sessionId = ''

async function rpc(
  settings: AppSettings,
  service: ServiceConfig,
  method: string,
  args: Record<string, unknown> = {},
): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (sessionId) headers['X-Transmission-Session-Id'] = sessionId
  if (service.username || service.password) {
    headers.Authorization = `Basic ${btoa(`${service.username ?? ''}:${service.password ?? ''}`)}`
  }

  const response = await serviceFetchUnchecked(settings, service, '/transmission/rpc', {
    method: 'POST',
    headers,
    body: JSON.stringify({ method, arguments: args }),
  })

  const nextSession = response.headers.get('X-Transmission-Session-Id')
  if (response.status === 409 && nextSession) {
    sessionId = nextSession
    return rpc(settings, service, method, args)
  }

  if (!response.ok) throw new Error(`Transmission error (${response.status})`)
  const payload = (await response.json()) as {
    result: string
    arguments?: { torrents?: TransmissionTorrent[] }
  }
  if (payload.result !== 'success') throw new Error(payload.result || 'Transmission failed')
  return payload.arguments
}

export async function getTransmissionTorrents(
  settings: AppSettings,
  service: ServiceConfig,
) {
  const data = (await rpc(settings, service, 'torrent-get', {
    fields: ['id', 'name', 'status', 'percentDone', 'rateDownload', 'eta', 'totalSize', 'hashString'],
  })) as { torrents?: TransmissionTorrent[] }
  return data.torrents ?? []
}

export async function getTransmissionVersion(
  settings: AppSettings,
  service: ServiceConfig,
) {
  await rpc(settings, service, 'session-get')
  return 'ok'
}

export async function transmissionPause(
  settings: AppSettings,
  service: ServiceConfig,
  ids: number[],
) {
  await rpc(settings, service, 'torrent-stop', { ids })
}

export async function transmissionResume(
  settings: AppSettings,
  service: ServiceConfig,
  ids: number[],
) {
  await rpc(settings, service, 'torrent-start', { ids })
}

export async function transmissionRemove(
  settings: AppSettings,
  service: ServiceConfig,
  ids: number[],
) {
  await rpc(settings, service, 'torrent-remove', { ids, 'delete-local-data': false })
}
