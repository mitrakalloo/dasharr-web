import { serviceJson } from '@/lib/http/client'
import type { ArrQualityProfile, ArrRootFolder, ArrStatus } from '@/lib/services/sonarr'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface ReadarrBook {
  id: number
  title: string
  titleSlug?: string
  monitored: boolean
  overview?: string
  releaseDate?: string
  author?: { authorName?: string }
  images?: Array<{ coverType: string; remoteUrl?: string; url?: string }>
}

export async function getReadarrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrStatus>(settings, service, '/api/v1/system/status')
}

export async function getReadarrBooks(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ReadarrBook[]>(settings, service, '/api/v1/book')
}

export async function lookupReadarrBooks(
  settings: AppSettings,
  service: ServiceConfig,
  term: string,
) {
  return serviceJson<ReadarrBook[]>(
    settings,
    service,
    `/api/v1/book/lookup?term=${encodeURIComponent(term)}`,
  )
}

export async function getReadarrRootFolders(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrRootFolder[]>(settings, service, '/api/v1/rootfolder')
}

export async function getReadarrQualityProfiles(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrQualityProfile[]>(settings, service, '/api/v1/qualityprofile')
}

export async function addReadarrBook(
  settings: AppSettings,
  service: ServiceConfig,
  body: Record<string, unknown>,
) {
  return serviceJson<ReadarrBook>(settings, service, '/api/v1/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
