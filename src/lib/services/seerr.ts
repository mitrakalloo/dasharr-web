import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface SeerrMedia {
  status: number
  tmdbId?: number
  tvdbId?: number
}

export interface SeerrRequest {
  id: number
  type: 'movie' | 'tv'
  status: number
  createdAt: string
  updatedAt: string
  media: SeerrMedia
  requestedBy?: {
    id: number
    displayName: string
    avatar?: string
  }
}

export interface SeerrStatus {
  version: string
  updateAvailable?: boolean
}

interface SeerrRequestPage {
  pageInfo: { pages: number; pageSize: number; results: number; page: number }
  results: SeerrRequest[]
}

export async function getSeerrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<SeerrStatus>(settings, service, '/api/v1/status')
}

export async function getSeerrRequests(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<SeerrRequestPage>(
    settings,
    service,
    '/api/v1/request?take=20&skip=0&filter=all&sort=added',
  )
}

export interface SeerrSearchResult {
  id: number
  mediaType: 'movie' | 'tv'
  popularity?: number
  posterPath?: string
  backdropPath?: string
  voteAverage?: number
  overview?: string
  genreIds?: number[]
  title?: string
  name?: string
  originalTitle?: string
  originalName?: string
  releaseDate?: string
  firstAirDate?: string
  mediaInfo?: SeerrMedia
}

export interface SeerrMediaDetails {
  id: number
  tmdbId?: number
  title?: string
  name?: string
  overview?: string
  posterPath?: string
  releaseDate?: string
  firstAirDate?: string
  status?: number
}

export async function searchSeerr(
  settings: AppSettings,
  service: ServiceConfig,
  query: string,
) {
  return serviceJson<SeerrSearchResult[]>(
    settings,
    service,
    `/api/v1/search?query=${encodeURIComponent(query)}`,
  )
}

export async function getSeerrMovie(
  settings: AppSettings,
  service: ServiceConfig,
  tmdbId: number,
) {
  return serviceJson<SeerrMediaDetails>(settings, service, `/api/v1/movie/${tmdbId}`)
}

export async function getSeerrTv(settings: AppSettings, service: ServiceConfig, tmdbId: number) {
  return serviceJson<SeerrMediaDetails>(settings, service, `/api/v1/tv/${tmdbId}`)
}

export async function createSeerrRequest(
  settings: AppSettings,
  service: ServiceConfig,
  body: {
    mediaType: 'movie' | 'tv'
    mediaId: number
    serverId?: number
    profileId?: number
    rootFolder?: string
    is4k?: boolean
    seasons?: number[] | 'all'
  },
) {
  return serviceJson<SeerrRequest>(settings, service, '/api/v1/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function approveSeerrRequest(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  return serviceJson<SeerrRequest>(settings, service, `/api/v1/request/${id}/approve`, {
    method: 'POST',
  })
}

export async function declineSeerrRequest(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  return serviceJson<SeerrRequest>(settings, service, `/api/v1/request/${id}/decline`, {
    method: 'POST',
  })
}

export function seerrStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return 'Pending'
    case 2:
      return 'Approved'
    case 3:
      return 'Declined'
    default:
      return 'Unknown'
  }
}
