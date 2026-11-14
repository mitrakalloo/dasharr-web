import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export type ManualImportMode = 'move' | 'copy'

export interface ManualImportCandidate {
  path: string
  relativePath?: string
  folderName?: string
  name?: string
  size?: number
  quality?: { quality?: { name?: string } }
  series?: { title?: string }
  movie?: { title?: string }
  episodes?: Array<{ id: number }>
  releaseGroup?: string
  downloadId?: string
  rejections?: Array<{ reason?: string }>
}

function apiRoot(service: ServiceConfig) {
  return service.type === 'lidarr' || service.type === 'readarr' ? '/api/v1' : '/api/v3'
}

export async function listManualImport(
  settings: AppSettings,
  service: ServiceConfig,
  downloadId?: string,
) {
  const params = new URLSearchParams()
  if (downloadId) params.set('downloadId', downloadId)
  const qs = params.toString()
  return serviceJson<ManualImportCandidate[]>(
    settings,
    service,
    `${apiRoot(service)}/manualimport${qs ? `?${qs}` : ''}`,
  )
}

export async function importManualFiles(
  settings: AppSettings,
  service: ServiceConfig,
  files: Array<Record<string, unknown>>,
  importMode: ManualImportMode = 'move',
) {
  return serviceJson<unknown>(settings, service, `${apiRoot(service)}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'ManualImport', files, importMode }),
  })
}
