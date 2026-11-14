import { serviceFetch, serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface QbitTorrent {
  hash: string
  name: string
  state: string
  progress: number
  dlspeed: number
  upspeed: number
  size: number
  downloaded: number
  eta: number
  category: string
  num_seeds: number
  num_leechs: number
  ratio: number
}

export async function qbitLogin(settings: AppSettings, service: ServiceConfig) {
  const body = new URLSearchParams({
    username: service.username ?? '',
    password: service.password ?? '',
  }).toString()

  await serviceFetch(settings, service, '/api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export async function getQbitTorrents(settings: AppSettings, service: ServiceConfig) {
  try {
    return await serviceJson<QbitTorrent[]>(settings, service, '/api/v2/torrents/info')
  } catch {
    await qbitLogin(settings, service)
    return serviceJson<QbitTorrent[]>(settings, service, '/api/v2/torrents/info')
  }
}

export async function getQbitVersion(settings: AppSettings, service: ServiceConfig) {
  try {
    const response = await serviceFetch(settings, service, '/api/v2/app/version')
    return (await response.text()).replace(/^v/, '')
  } catch {
    await qbitLogin(settings, service)
    const response = await serviceFetch(settings, service, '/api/v2/app/version')
    return (await response.text()).replace(/^v/, '')
  }
}

export async function qbitPause(settings: AppSettings, service: ServiceConfig, hashes: string) {
  const body = new URLSearchParams({ hashes }).toString()
  await serviceFetch(settings, service, '/api/v2/torrents/pause', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export async function qbitResume(settings: AppSettings, service: ServiceConfig, hashes: string) {
  const body = new URLSearchParams({ hashes }).toString()
  await serviceFetch(settings, service, '/api/v2/torrents/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export async function qbitDelete(
  settings: AppSettings,
  service: ServiceConfig,
  hashes: string,
  deleteFiles = false,
) {
  const body = new URLSearchParams({
    hashes,
    deleteFiles: deleteFiles ? 'true' : 'false',
  }).toString()
  await serviceFetch(settings, service, '/api/v2/torrents/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export async function qbitForceRetry(
  settings: AppSettings,
  service: ServiceConfig,
  hashes: string,
) {
  const body = new URLSearchParams({ hashes }).toString()
  await serviceFetch(settings, service, '/api/v2/torrents/reannounce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  await serviceFetch(settings, service, '/api/v2/torrents/recheck', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}
