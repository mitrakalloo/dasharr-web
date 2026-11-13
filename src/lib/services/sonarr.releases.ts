import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface ArrRelease {
  guid: string
  title: string
  indexerId: number
  indexer?: string
  size: number
  age?: number
  ageHours?: number
  seeders?: number
  leechers?: number
  quality?: { quality?: { name?: string } }
  protocol?: string
  approved?: boolean
  rejected?: boolean
  rejections?: string[]
  releaseWeight?: number
}

export async function searchSonarrEpisodeReleases(
  settings: AppSettings,
  service: ServiceConfig,
  episodeId: number,
) {
  return serviceJson<ArrRelease[]>(
    settings,
    service,
    `/api/v3/release?episodeId=${episodeId}`,
  )
}

export async function grabSonarrRelease(
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

export async function commandSonarrEpisodeSearch(
  settings: AppSettings,
  service: ServiceConfig,
  episodeIds: number[],
) {
  return serviceJson<unknown>(settings, service, '/api/v3/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'EpisodeSearch', episodeIds }),
  })
}

export async function commandSonarrSeasonSearch(
  settings: AppSettings,
  service: ServiceConfig,
  seriesId: number,
  seasonNumber: number,
) {
  return serviceJson<unknown>(settings, service, '/api/v3/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'SeasonSearch', seriesId, seasonNumber }),
  })
}
