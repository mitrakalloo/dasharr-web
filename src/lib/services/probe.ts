import { getDelugeVersion } from '@/lib/services/deluge'
import { getLidarrStatus } from '@/lib/services/lidarr'
import { getNzbgetVersion } from '@/lib/services/nzbget'
import { getProwlarrStatus } from '@/lib/services/prowlarr'
import { getQbitVersion } from '@/lib/services/qbittorrent'
import { getRadarrStatus } from '@/lib/services/radarr'
import { getSabVersion } from '@/lib/services/sabnzbd'
import { getSeerrStatus } from '@/lib/services/seerr'
import { getSonarrStatus } from '@/lib/services/sonarr'
import { getTautulliVersion } from '@/lib/services/tautulli'
import { getTransmissionVersion } from '@/lib/services/transmission'
import type { AppSettings, ServiceConfig } from '@/types/config'

/** Hits the service status/version endpoint and returns a version string. */
export async function probeService(
  settings: AppSettings,
  service: ServiceConfig,
): Promise<string> {
  switch (service.type) {
    case 'sonarr': {
      const data = await getSonarrStatus(settings, service)
      return data.version
    }
    case 'radarr': {
      const data = await getRadarrStatus(settings, service)
      return data.version
    }
    case 'lidarr': {
      const data = await getLidarrStatus(settings, service)
      return data.version
    }
    case 'sabnzbd': {
      const data = await getSabVersion(settings, service)
      return data.version
    }
    case 'qbittorrent': {
      return getQbitVersion(settings, service)
    }
    case 'seerr': {
      const data = await getSeerrStatus(settings, service)
      return data.version
    }
    case 'prowlarr': {
      const data = await getProwlarrStatus(settings, service)
      return data.version
    }
    case 'tautulli': {
      return getTautulliVersion(settings, service)
    }
    case 'transmission': {
      return getTransmissionVersion(settings, service)
    }
    case 'nzbget': {
      return getNzbgetVersion(settings, service)
    }
    case 'deluge': {
      return getDelugeVersion(settings, service)
    }
  }
}
