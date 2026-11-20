import { serviceJson } from '@/lib/http/client'
import type {
  ArrQualityProfile,
  ArrQueueItem,
  ArrRootFolder,
  ArrStatus,
  SonarrEpisode,
  SonarrLookupSeries,
  SonarrSeries,
} from '@/lib/services/sonarr.types'
import type { AppSettings, ServiceConfig } from '@/types/config'

export type {
  ArrQualityProfile,
  ArrQueueItem,
  ArrRootFolder,
  ArrStatus,
  SonarrEpisode,
  SonarrLookupSeries,
  SonarrSeries,
} from '@/lib/services/sonarr.types'

export type { SonarrCalendarEpisode } from '@/lib/services/sonarr.calendar'
export { getSonarrCalendar } from '@/lib/services/sonarr.calendar'
export type { ArrRelease } from '@/lib/services/sonarr.releases'
export {
  commandSonarrEpisodeSearch,
  commandSonarrSeasonSearch,
  grabSonarrRelease,
  searchSonarrEpisodeReleases,
} from '@/lib/services/sonarr.releases'

export async function getSonarrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrStatus>(settings, service, '/api/v3/system/status')
}

export async function getSonarrSeries(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<SonarrSeries[]>(settings, service, '/api/v3/series')
}

export async function getSonarrSeriesById(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  return serviceJson<SonarrSeries>(settings, service, `/api/v3/series/${id}`)
}

export async function getSonarrEpisodes(
  settings: AppSettings,
  service: ServiceConfig,
  seriesId: number,
) {
  return serviceJson<SonarrEpisode[]>(
    settings,
    service,
    `/api/v3/episode?seriesId=${seriesId}`,
  )
}

export async function lookupSonarrSeries(
  settings: AppSettings,
  service: ServiceConfig,
  term: string,
) {
  return serviceJson<SonarrLookupSeries[]>(
    settings,
    service,
    `/api/v3/series/lookup?term=${encodeURIComponent(term)}`,
  )
}

export async function getSonarrRootFolders(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrRootFolder[]>(settings, service, '/api/v3/rootfolder')
}

export async function getSonarrQualityProfiles(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrQualityProfile[]>(settings, service, '/api/v3/qualityprofile')
}

export async function addSonarrSeries(
  settings: AppSettings,
  service: ServiceConfig,
  body: Record<string, unknown>,
) {
  return serviceJson<SonarrSeries>(settings, service, '/api/v3/series', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function getSonarrQueue(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{ records: ArrQueueItem[] } | ArrQueueItem[]>(
    settings,
    service,
    '/api/v3/queue?page=1&pageSize=50&includeUnknownSeriesItems=true',
  )
  return Array.isArray(data) ? data : data.records
}

export async function deleteSonarrQueueItem(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
  removeFromClient = true,
  blocklist = false,
) {
  const params = new URLSearchParams({
    removeFromClient: String(removeFromClient),
    blocklist: String(blocklist),
  })
  await serviceJson<unknown>(settings, service, `/api/v3/queue/${id}?${params}`, {
    method: 'DELETE',
  })
}

export async function updateSonarrSeries(
  settings: AppSettings,
  service: ServiceConfig,
  series: SonarrSeries,
) {
  return serviceJson<SonarrSeries>(settings, service, `/api/v3/series/${series.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(series),
  })
}

export async function getSonarrWantedMissing(
  settings: AppSettings,
  service: ServiceConfig,
) {
  const data = await serviceJson<{
    records: Array<{
      id: number
      seriesId: number
      seasonNumber: number
      episodeNumber: number
      title?: string
      airDate?: string
      series?: { title?: string }
    }>
  }>(settings, service, '/api/v3/wanted/missing?page=1&pageSize=50&sortDirection=descending')
  return data.records
}

export async function getSonarrWantedCutoff(
  settings: AppSettings,
  service: ServiceConfig,
) {
  const data = await serviceJson<{
    records: Array<{
      id: number
      seriesId: number
      seasonNumber: number
      episodeNumber: number
      title?: string
      airDate?: string
      series?: { title?: string }
    }>
  }>(settings, service, '/api/v3/wanted/cutoff?page=1&pageSize=50&sortDirection=descending')
  return data.records
}

export async function getSonarrHealth(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<import('@/lib/services/sonarr.types').ArrHealthWarning[]>(
    settings,
    service,
    '/api/v3/health',
  )
}

export async function updateSonarrEpisodeMonitored(
  settings: AppSettings,
  service: ServiceConfig,
  episodeIds: number[],
  monitored: boolean,
) {
  return serviceJson<unknown>(settings, service, '/api/v3/episode/monitor', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ episodeIds, monitored }),
  })
}

export async function getSonarrHistory(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{
    records: Array<{
      id: number
      seriesId?: number
      episodeId?: number
      sourceTitle?: string
      date: string
      eventType: string
      series?: { title?: string }
    }>
  }>(settings, service, '/api/v3/history?page=1&pageSize=50&sortDirection=descending')
  return data.records
}

export function sonarrPosterUrl(series: SonarrSeries, baseUrl: string): string | undefined {
  const poster = series.images?.find((image) => image.coverType === 'poster')
  const url = poster?.remoteUrl ?? poster?.url
  if (!url) return undefined
  if (url.startsWith('http')) return url
  return `${baseUrl.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}
