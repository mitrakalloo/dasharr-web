import { serviceJson } from '@/lib/http/client'
import type { NamedOption } from '@/features/search/addOptions.types'
import type { AppSettings, ServiceConfig } from '@/types/config'

interface SeerrServiceRow {
  id: number
  name: string
  is4k?: boolean
  isDefault?: boolean
  activeProfiles?: Array<{ id: number; name: string }>
  activeDirectory?: string
  activeDirectories?: string[]
}

export async function getSeerrRequestOptions(
  settings: AppSettings,
  service: ServiceConfig,
  mediaType: 'movie' | 'tv',
) {
  const path = mediaType === 'tv' ? '/api/v1/service/sonarr' : '/api/v1/service/radarr'
  const servers = await serviceJson<SeerrServiceRow[]>(settings, service, path)
  const def = servers.find((row) => row.isDefault) ?? servers[0]
  if (!def) {
    return {
      mode: 'request' as const,
      qualityProfiles: [] as NamedOption[],
      rootFolders: [] as NamedOption[],
      servers: [] as NamedOption[],
    }
  }

  const detail = await serviceJson<SeerrServiceRow>(
    settings,
    service,
    `${path}/${def.id}`,
  ).catch(() => def)

  const profiles = (detail.activeProfiles ?? []).map((profile) => ({
    id: profile.id,
    name: profile.name,
  }))
  const folders = (
    detail.activeDirectories?.length
      ? detail.activeDirectories
      : detail.activeDirectory
        ? [detail.activeDirectory]
        : []
  ).map((pathValue, index) => ({
    id: index,
    name: pathValue,
    path: pathValue,
  }))

  return {
    mode: 'request' as const,
    qualityProfiles: profiles,
    rootFolders: folders,
    servers: servers.map((row) => ({ id: row.id, name: row.name })),
    defaultServerId: def.id,
  }
}
