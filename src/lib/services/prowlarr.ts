import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'
import type { ArrStatus } from '@/lib/services/sonarr'

export interface ProwlarrIndexer {
  id: number
  name: string
  enable: boolean
  protocol: string
  priority: number
  supportsRss: boolean
  supportsSearch: boolean
  [key: string]: unknown
}

export async function getProwlarrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrStatus>(settings, service, '/api/v1/system/status')
}

export async function getProwlarrIndexers(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ProwlarrIndexer[]>(settings, service, '/api/v1/indexer')
}

export async function toggleProwlarrIndexer(
  settings: AppSettings,
  service: ServiceConfig,
  indexer: ProwlarrIndexer,
  enable: boolean,
) {
  return serviceJson<ProwlarrIndexer>(settings, service, `/api/v1/indexer/${indexer.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...indexer, enable }),
  })
}

export interface ProwlarrRelease {
  guid: string
  indexerId: number
  title: string
  size: number
  protocol: string
  indexer?: string
  seeders?: number
  leechers?: number
  publishDate?: string
}

export async function searchProwlarrReleases(
  settings: AppSettings,
  service: ServiceConfig,
  query: string,
) {
  const params = new URLSearchParams({
    query,
    type: 'search',
    limit: '50',
  })
  return serviceJson<ProwlarrRelease[]>(
    settings,
    service,
    `/api/v1/search?${params.toString()}`,
  )
}

export async function grabProwlarrRelease(
  settings: AppSettings,
  service: ServiceConfig,
  release: Pick<ProwlarrRelease, 'guid' | 'indexerId'>,
) {
  return serviceJson<unknown>(settings, service, '/api/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guid: release.guid,
      indexerId: release.indexerId,
    }),
  })
}
