import { serviceJson } from '@/lib/http/client'
import type { ArrRelease } from '@/lib/services/sonarr.releases'
import type { AppSettings, ServiceConfig } from '@/types/config'

export async function searchLidarrAlbumReleases(
  settings: AppSettings,
  service: ServiceConfig,
  albumId: number,
) {
  return serviceJson<ArrRelease[]>(settings, service, `/api/v1/release?albumId=${albumId}`)
}

export async function grabLidarrRelease(
  settings: AppSettings,
  service: ServiceConfig,
  release: Pick<ArrRelease, 'guid' | 'indexerId'>,
) {
  return serviceJson<unknown>(settings, service, '/api/v1/release', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guid: release.guid, indexerId: release.indexerId }),
  })
}

export async function commandLidarrAlbumSearch(
  settings: AppSettings,
  service: ServiceConfig,
  albumIds: number[],
) {
  return serviceJson<unknown>(settings, service, '/api/v1/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'AlbumSearch', albumIds }),
  })
}

export async function updateLidarrAlbum(
  settings: AppSettings,
  service: ServiceConfig,
  album: Record<string, unknown> & { id: number },
) {
  return serviceJson<unknown>(settings, service, `/api/v1/album/${album.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(album),
  })
}
