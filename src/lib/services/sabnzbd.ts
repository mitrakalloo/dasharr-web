import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface SabQueueSlot {
  nzo_id: string
  filename: string
  status: string
  percentage: string
  size: string
  sizeleft: string
  timeleft: string
  mb: string
  mbleft: string
  category: string
}

export interface SabQueue {
  status: string
  speed: string
  speedlimit: string
  sizeleft: string
  timeleft: string
  noofslots: number
  slots: SabQueueSlot[]
  kbpersec?: string
}

interface SabResponse {
  queue?: SabQueue
  status?: boolean
  version?: string
}

export async function getSabQueue(settings: AppSettings, service: ServiceConfig) {
  const data = await serviceJson<SabResponse>(
    settings,
    service,
    '/api?mode=queue&output=json',
  )
  return data.queue
}

export async function getSabVersion(settings: AppSettings, service: ServiceConfig) {
  return serviceJson<{ version: string }>(settings, service, '/api?mode=version&output=json')
}

export async function sabPause(settings: AppSettings, service: ServiceConfig, nzoId?: string) {
  const path = nzoId
    ? `/api?mode=queue&name=pause&value=${encodeURIComponent(nzoId)}&output=json`
    : '/api?mode=pause&output=json'
  return serviceJson<SabResponse>(settings, service, path)
}

export async function sabResume(settings: AppSettings, service: ServiceConfig, nzoId?: string) {
  const path = nzoId
    ? `/api?mode=queue&name=resume&value=${encodeURIComponent(nzoId)}&output=json`
    : '/api?mode=resume&output=json'
  return serviceJson<SabResponse>(settings, service, path)
}
