import { serviceFetch, serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

async function runCommand(
  settings: AppSettings,
  service: ServiceConfig,
  name: string,
  body: Record<string, unknown> = {},
) {
  const root = service.type === 'lidarr' ? '/api/v1' : '/api/v3'
  return serviceJson<unknown>(settings, service, `${root}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ...body }),
  })
}

export async function searchMissingArr(settings: AppSettings, service: ServiceConfig) {
  if (service.type === 'sonarr') return runCommand(settings, service, 'MissingEpisodeSearch')
  if (service.type === 'radarr') return runCommand(settings, service, 'MissingMoviesSearch')
  if (service.type === 'lidarr') return runCommand(settings, service, 'MissingAlbumSearch')
  throw new Error('Search missing isn’t supported for this service')
}

export async function rssSyncArr(settings: AppSettings, service: ServiceConfig) {
  return runCommand(settings, service, 'RssSync')
}

export async function refreshMonitoredArr(settings: AppSettings, service: ServiceConfig) {
  if (service.type === 'sonarr') return runCommand(settings, service, 'RefreshSeries')
  if (service.type === 'radarr') return runCommand(settings, service, 'RefreshMovie')
  if (service.type === 'lidarr') return runCommand(settings, service, 'RefreshAlbum')
  throw new Error('Refresh isn’t supported for this service')
}

export async function refreshArrItem(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  if (service.type === 'sonarr') {
    return runCommand(settings, service, 'RefreshSeries', { seriesId: id })
  }
  if (service.type === 'radarr') {
    return runCommand(settings, service, 'RefreshMovie', { movieId: id })
  }
  if (service.type === 'lidarr') {
    return runCommand(settings, service, 'RefreshAlbum', { albumIds: [id] })
  }
  throw new Error('Refresh isn’t supported for this service')
}

export async function deleteArrLibraryItem(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
  deleteFiles: boolean,
) {
  const root = service.type === 'lidarr' ? '/api/v1' : '/api/v3'
  const resource =
    service.type === 'sonarr' ? 'series' : service.type === 'radarr' ? 'movie' : 'album'
  const response = await serviceFetch(
    settings,
    service,
    `${root}/${resource}/${id}?deleteFiles=${deleteFiles}&addImportExclusion=false`,
    { method: 'DELETE' },
  )
  if (!response.ok) throw new Error(`Delete failed (${response.status})`)
}
