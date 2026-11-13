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
}

export async function getProwlarrStatus(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ArrStatus>(settings, service, '/api/v1/system/status')
}

export async function getProwlarrIndexers(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<ProwlarrIndexer[]>(settings, service, '/api/v1/indexer')
}
