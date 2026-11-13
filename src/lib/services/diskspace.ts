import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface ArrDiskSpace {
  path: string
  label?: string
  freeSpace: number
  totalSpace: number
}

export async function getArrDiskSpace(settings: AppSettings, service: ServiceConfig) {
  const version = service.type === 'lidarr' ? 'v1' : 'v3'
  return serviceJson<ArrDiskSpace[]>(
    settings,
    service,
    `/api/${version}/diskspace`,
  )
}
