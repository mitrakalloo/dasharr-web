import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'
import type { ArrRelease } from '@/lib/services/sonarr.releases'
import type {
  ArrQualityProfile,
  ArrQueueItem,
  ArrRootFolder,
  ArrStatus,
} from '@/lib/services/sonarr'

export interface RadarrMovie {
  id: number
  title: string
  year?: number
  added?: string
  status: string
  overview?: string
  path?: string
  monitored: boolean
  hasFile: boolean
  sizeOnDisk?: number
  runtime?: number
  genres?: string[]
  tmdbId?: number
  imdbId?: string
  titleSlug?: string
  qualityProfileId?: number
  rootFolderPath?: string
  images?: Array<{ coverType: string; remoteUrl?: string; url?: string }>
  ratings?: { imdb?: { value: number }; tmdb?: { value: number }; value?: number }
}

export async function getRadarrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrStatus>(settings, service, '/api/v3/system/status')
}

export async function getRadarrMovies(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<RadarrMovie[]>(settings, service, '/api/v3/movie')
}

export async function getRadarrMovieById(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  return serviceJson<RadarrMovie>(settings, service, `/api/v3/movie/${id}`)
}

export async function lookupRadarrMovies(
  settings: AppSettings,
  service: ServiceConfig,
  term: string,
) {
  return serviceJson<RadarrMovie[]>(
    settings,
    service,
    `/api/v3/movie/lookup?term=${encodeURIComponent(term)}`,
  )
}

export async function getRadarrRootFolders(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrRootFolder[]>(settings, service, '/api/v3/rootfolder')
}

export async function getRadarrQualityProfiles(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrQualityProfile[]>(settings, service, '/api/v3/qualityprofile')
}

export async function addRadarrMovie(
  settings: AppSettings,
  service: ServiceConfig,
  body: Record<string, unknown>,
) {
  return serviceJson<RadarrMovie>(settings, service, '/api/v3/movie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function getRadarrQueue(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{ records: ArrQueueItem[] } | ArrQueueItem[]>(
    settings,
    service,
    '/api/v3/queue?page=1&pageSize=50&includeUnknownMovieItems=true',
  )
  return Array.isArray(data) ? data : data.records
}

export async function deleteRadarrQueueItem(
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

export async function updateRadarrMovie(
  settings: AppSettings,
  service: ServiceConfig,
  movie: RadarrMovie,
) {
  return serviceJson<RadarrMovie>(settings, service, `/api/v3/movie/${movie.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  })
}

export async function getRadarrWantedMissing(
  settings: AppSettings,
  service: ServiceConfig,
) {
  const data = await serviceJson<{
    records: Array<{
      id: number
      title: string
      year?: number
      hasFile: boolean
      isAvailable?: boolean
    }>
  }>(settings, service, '/api/v3/wanted/missing?page=1&pageSize=50&sortDirection=descending')
  return data.records
}

export async function getRadarrWantedCutoff(
  settings: AppSettings,
  service: ServiceConfig,
) {
  const data = await serviceJson<{
    records: Array<{
      id: number
      title: string
      year?: number
      hasFile: boolean
      isAvailable?: boolean
    }>
  }>(settings, service, '/api/v3/wanted/cutoff?page=1&pageSize=50&sortDirection=descending')
  return data.records
}

export async function getRadarrHealth(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<import('@/lib/services/sonarr.types').ArrHealthWarning[]>(
    settings,
    service,
    '/api/v3/health',
  )
}

export async function getRadarrHistory(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{
    records: Array<{
      id: number
      movieId?: number
      sourceTitle?: string
      date: string
      eventType: string
      movie?: { title?: string; year?: number }
    }>
  }>(settings, service, '/api/v3/history?page=1&pageSize=50&sortDirection=descending')
  return data.records
}

export interface RadarrCalendarMovie extends RadarrMovie {
  inCinemas?: string
  physicalRelease?: string
  digitalRelease?: string
}

export async function getRadarrCalendar(
  settings: AppSettings,
  service: ServiceConfig,
  start: string,
  end: string,
) {
  const params = new URLSearchParams({
    start,
    end,
    unmonitored: 'false',
  })
  return serviceJson<RadarrCalendarMovie[]>(
    settings,
    service,
    `/api/v3/calendar?${params.toString()}`,
  )
}

export function radarrPosterUrl(movie: RadarrMovie, baseUrl: string): string | undefined {
  const poster = movie.images?.find((image) => image.coverType === 'poster')
  const url = poster?.remoteUrl ?? poster?.url
  if (!url) return undefined
  if (url.startsWith('http')) return url
  return `${baseUrl.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}

export async function searchRadarrMovieReleases(
  settings: AppSettings,
  service: ServiceConfig,
  movieId: number,
) {
  return serviceJson<ArrRelease[]>(settings, service, `/api/v3/release?movieId=${movieId}`)
}

export async function grabRadarrRelease(
  settings: AppSettings,
  service: ServiceConfig,
  release: Pick<ArrRelease, 'guid' | 'indexerId'>,
) {
  return serviceJson<unknown>(settings, service, '/api/v3/release', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guid: release.guid, indexerId: release.indexerId }),
  })
}

export async function commandRadarrMoviesSearch(
  settings: AppSettings,
  service: ServiceConfig,
  movieIds: number[],
) {
  return serviceJson<unknown>(settings, service, '/api/v3/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'MoviesSearch', movieIds }),
  })
}
