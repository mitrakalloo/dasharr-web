import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'
import type {
  ArrQualityProfile,
  ArrQueueItem,
  ArrRootFolder,
  ArrStatus,
} from '@/lib/services/sonarr'

export interface LidarrAlbum {
  id: number
  title: string
  disambiguation?: string
  overview?: string
  monitored: boolean
  releaseDate?: string
  artist?: {
    id: number
    artistName: string
    images?: Array<{ coverType: string; remoteUrl?: string; url?: string }>
  }
  images?: Array<{ coverType: string; remoteUrl?: string; url?: string }>
}

export async function getLidarrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrStatus>(settings, service, '/api/v1/system/status')
}

export async function getLidarrCalendar(
  settings: AppSettings,
  service: ServiceConfig,
  start: string,
  end: string,
) {
  const params = new URLSearchParams({ start, end, unmonitored: 'false' })
  return serviceJson<LidarrAlbum[]>(
    settings,
    service,
    `/api/v1/calendar?${params.toString()}`,
  )
}

export async function getLidarrAlbums(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<LidarrAlbum[]>(settings, service, '/api/v1/album')
}

export async function getLidarrAlbum(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  return serviceJson<LidarrAlbum>(settings, service, `/api/v1/album/${id}`)
}

export async function lookupLidarrAlbums(
  settings: AppSettings,
  service: ServiceConfig,
  term: string,
) {
  return serviceJson<LidarrAlbum[]>(
    settings,
    service,
    `/api/v1/album/lookup?term=${encodeURIComponent(term)}`,
  )
}

export async function getLidarrRootFolders(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrRootFolder[]>(settings, service, '/api/v1/rootfolder')
}

export async function getLidarrQualityProfiles(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrQualityProfile[]>(settings, service, '/api/v1/qualityprofile')
}

export async function addLidarrAlbum(
  settings: AppSettings,
  service: ServiceConfig,
  body: Record<string, unknown>,
) {
  return serviceJson<LidarrAlbum>(settings, service, '/api/v1/album', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function getLidarrQueue(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<{ records?: ArrQueueItem[] } | ArrQueueItem[]>(
    settings,
    service,
    '/api/v1/queue?page=1&pageSize=50',
  )
  return Array.isArray(data) ? data : (data.records ?? [])
}

export async function deleteLidarrQueueItem(
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
  await serviceJson<unknown>(settings, service, `/api/v1/queue/${id}?${params}`, {
    method: 'DELETE',
  })
}

export async function getLidarrWantedMissing(
  settings: AppSettings,
  service: ServiceConfig,
) {
  const data = await serviceJson<{
    records: Array<{
      id: number
      title: string
      artistId?: number
      artist?: { artistName?: string }
      releaseDate?: string
    }>
  }>(settings, service, '/api/v1/wanted/missing?page=1&pageSize=50&sortDirection=descending')
  return data.records
}

export function lidarrCoverUrl(
  item: { images?: Array<{ coverType: string; remoteUrl?: string; url?: string }> },
  baseUrl: string,
): string | undefined {
  const cover =
    item.images?.find((image) => image.coverType === 'cover') ??
    item.images?.find((image) => image.coverType === 'poster')
  const url = cover?.remoteUrl ?? cover?.url
  if (!url) return undefined
  if (url.startsWith('http')) return url
  return `${baseUrl.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}
