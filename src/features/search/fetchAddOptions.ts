import type { AddOptionsBundle } from '@/features/search/addOptions.types'
import {
  getLidarrQualityProfiles,
  getLidarrRootFolders,
} from '@/lib/services/lidarr'
import {
  getRadarrQualityProfiles,
  getRadarrRootFolders,
} from '@/lib/services/radarr'
import {
  getReadarrQualityProfiles,
  getReadarrRootFolders,
} from '@/lib/services/readarr'
import { getSeerrRequestOptions } from '@/lib/services/seerr.requestOptions'
import {
  getSonarrQualityProfiles,
  getSonarrRootFolders,
} from '@/lib/services/sonarr'
import {
  getWhisparrQualityProfiles,
  getWhisparrRootFolders,
} from '@/lib/services/whisparr'
import type { AppSettings, ServiceConfig } from '@/types/config'

export async function fetchAddOptionsBundle(
  settings: AppSettings,
  service: ServiceConfig,
  mediaType: 'movie' | 'tv' | 'album' | 'book' = 'movie',
): Promise<AddOptionsBundle> {
  if (service.type === 'seerr') {
    return getSeerrRequestOptions(
      settings,
      service,
      mediaType === 'tv' ? 'tv' : 'movie',
    )
  }

  if (service.type === 'sonarr') {
    const [roots, profiles] = await Promise.all([
      getSonarrRootFolders(settings, service),
      getSonarrQualityProfiles(settings, service),
    ])
    return {
      mode: 'add',
      qualityProfiles: profiles.map((profile) => ({ id: profile.id, name: profile.name })),
      rootFolders: roots.map((root) => ({ id: root.id, name: root.path, path: root.path })),
    }
  }

  if (service.type === 'radarr' || service.type === 'whisparr') {
    const [roots, profiles] =
      service.type === 'whisparr'
        ? await Promise.all([
            getWhisparrRootFolders(settings, service),
            getWhisparrQualityProfiles(settings, service),
          ])
        : await Promise.all([
            getRadarrRootFolders(settings, service),
            getRadarrQualityProfiles(settings, service),
          ])
    return {
      mode: 'add',
      qualityProfiles: profiles.map((profile) => ({ id: profile.id, name: profile.name })),
      rootFolders: roots.map((root) => ({ id: root.id, name: root.path, path: root.path })),
    }
  }

  if (service.type === 'lidarr') {
    const [roots, profiles] = await Promise.all([
      getLidarrRootFolders(settings, service),
      getLidarrQualityProfiles(settings, service),
    ])
    return {
      mode: 'add',
      qualityProfiles: profiles.map((profile) => ({ id: profile.id, name: profile.name })),
      rootFolders: roots.map((root) => ({ id: root.id, name: root.path, path: root.path })),
    }
  }

  if (service.type === 'readarr') {
    const [roots, profiles] = await Promise.all([
      getReadarrRootFolders(settings, service),
      getReadarrQualityProfiles(settings, service),
    ])
    return {
      mode: 'add',
      qualityProfiles: profiles.map((profile) => ({ id: profile.id, name: profile.name })),
      rootFolders: roots.map((root) => ({ id: root.id, name: root.path, path: root.path })),
    }
  }

  return { mode: 'add', qualityProfiles: [], rootFolders: [] }
}
