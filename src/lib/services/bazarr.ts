import { serviceFetch, serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface BazarrMissingLanguage {
  code2?: string
  code3?: string
  name?: string
  forced?: boolean
  hi?: boolean
}

export interface BazarrWantedItem {
  sonarrSeriesId?: number
  sonarrEpisodeId?: number
  radarrId?: number
  title?: string
  seriesTitle?: string
  episode_number?: string
  missing_subtitles?: BazarrMissingLanguage[]
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

export async function searchBazarrEpisodeSubtitle(
  settings: AppSettings,
  service: ServiceConfig,
  params: { seriesId: number; episodeId: number; language: string; forced?: boolean; hi?: boolean },
) {
  const query = new URLSearchParams({
    seriesid: String(params.seriesId),
    episodeid: String(params.episodeId),
    language: params.language,
    forced: params.forced ? 'true' : 'false',
    hi: params.hi ? 'true' : 'false',
  })
  await serviceFetch(settings, service, `/api/episodes/subtitles?${query.toString()}`, {
    method: 'PATCH',
  })
}

export async function searchBazarrMovieSubtitle(
  settings: AppSettings,
  service: ServiceConfig,
  params: { radarrId: number; language: string; forced?: boolean; hi?: boolean },
) {
  const query = new URLSearchParams({
    radarrid: String(params.radarrId),
    language: params.language,
    forced: params.forced ? 'true' : 'false',
    hi: params.hi ? 'true' : 'false',
  })
  await serviceFetch(settings, service, `/api/movies/subtitles?${query.toString()}`, {
    method: 'PATCH',
  })
}
