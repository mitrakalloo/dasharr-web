import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'
import type { ArrStatus } from '@/lib/services/sonarr'

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

export async function getLidarrAlbum(
  settings: AppSettings,
  service: ServiceConfig,
  id: number,
) {
  return serviceJson<LidarrAlbum>(settings, service, `/api/v1/album/${id}`)
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
