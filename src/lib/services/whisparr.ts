import { serviceJson } from '@/lib/http/client'
import type { ArrQualityProfile, ArrRootFolder, ArrStatus } from '@/lib/services/sonarr'
import type { RadarrMovie } from '@/lib/services/radarr'
import type { AppSettings, ServiceConfig } from '@/types/config'

export async function getWhisparrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrStatus>(settings, service, '/api/v3/system/status')
}

export async function getWhisparrMovies(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<RadarrMovie[]>(settings, service, '/api/v3/movie')
}

export async function lookupWhisparrMovies(
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

export async function getWhisparrRootFolders(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrRootFolder[]>(settings, service, '/api/v3/rootfolder')
}

export async function getWhisparrQualityProfiles(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrQualityProfile[]>(settings, service, '/api/v3/qualityprofile')
}

export async function addWhisparrMovie(
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
