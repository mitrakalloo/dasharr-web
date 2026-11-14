import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface BazarrWantedItem {
  sonarrSeriesId?: number
  radarrId?: number
  title?: string
  seriesTitle?: string
  episode_number?: string
  missing_subtitles?: Array<{ code2?: string }>
}

export async function getBazarrVersion(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{ bazarr_version?: string }>(
    settings,
    service,
    '/api/system/status',
  )
  return data.bazarr_version ?? 'ok'
}

export async function getBazarrWantedEpisodes(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{ data?: BazarrWantedItem[] }>(
    settings,
    service,
    '/api/episodes/wanted?start=0&length=50',
  )
  return data.data ?? []
}

export async function getBazarrWantedMovies(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{ data?: BazarrWantedItem[] }>(
    settings,
    service,
    '/api/movies/wanted?start=0&length=50',
  )
  return data.data ?? []
}
