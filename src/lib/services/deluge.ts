import { serviceFetch } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface DelugeTorrent {
  hash: string
  name: string
  progress: number
  download_payload_rate: number
  eta: number
  total_size: number
  state: string
}

async function delugeRpc(
  settings: AppSettings,
  service: ServiceConfig,
  method: string,
  params: unknown[] = [],
) {
  const password = service.password ?? service.apiKey
  const login = await serviceFetch(settings, service, '/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'auth.login',
      params: [password],
      id: 1,
    }),
  })
  if (!login.ok) throw new Error(`Deluge login failed (${login.status})`)

  const response = await serviceFetch(settings, service, '/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params, id: 2 }),
  })
  if (!response.ok) throw new Error(`Deluge error (${response.status})`)
  const payload = (await response.json()) as { result?: unknown; error?: { message?: string } }
  if (payload.error) throw new Error(payload.error.message ?? 'Deluge failed')
  return payload.result
}

export async function getDelugeTorrents(settings: AppSettings, service: ServiceConfig) {
  const result = (await delugeRpc(settings, service, 'web.update_ui', [
    ['name', 'progress', 'download_payload_rate', 'eta', 'total_size', 'state'],
    {},
  ])) as { torrents?: Record<string, Omit<DelugeTorrent, 'hash'>> }
  return Object.entries(result.torrents ?? {}).map(([hash, torrent]) => ({
    hash,
    ...torrent,
  }))
}

export async function getDelugeVersion(settings: AppSettings, service: ServiceConfig) {
  await delugeRpc(settings, service, 'web.connected')
  return 'ok'
}

export async function delugePause(
  settings: AppSettings,
  service: ServiceConfig,
  hashes: string[],
) {
  await delugeRpc(settings, service, 'core.pause_torrent', [hashes])
}

export async function delugeResume(
  settings: AppSettings,
  service: ServiceConfig,
  hashes: string[],
) {
  await delugeRpc(settings, service, 'core.resume_torrent', [hashes])
}

export async function delugeRemove(
  settings: AppSettings,
  service: ServiceConfig,
  hashes: string[],
) {
  for (const hash of hashes) {
    await delugeRpc(settings, service, 'core.remove_torrent', [hash, false])
  }
}
