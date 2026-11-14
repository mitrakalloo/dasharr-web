import { getBazarrVersion } from '@/lib/services/bazarr'
import { getDelugeVersion } from '@/lib/services/deluge'
import { getLidarrStatus } from '@/lib/services/lidarr'
import { getNzbgetVersion } from '@/lib/services/nzbget'
import { getProwlarrStatus } from '@/lib/services/prowlarr'
import { getQbitVersion } from '@/lib/services/qbittorrent'
import { getRadarrStatus } from '@/lib/services/radarr'
import { getReadarrStatus } from '@/lib/services/readarr'
import { getSabVersion } from '@/lib/services/sabnzbd'
import { getSeerrStatus } from '@/lib/services/seerr'
import { getSonarrStatus } from '@/lib/services/sonarr'
import { getTautulliVersion } from '@/lib/services/tautulli'
import { getTransmissionVersion } from '@/lib/services/transmission'
import { getUnraidVersion } from '@/lib/services/unraid'
import { getWhisparrStatus } from '@/lib/services/whisparr'
import type { AppSettings, ServiceConfig } from '@/types/config'

/** Hits the service status/version endpoint and returns a version string. */
export async function probeService(
  settings: AppSettings,
  service: ServiceConfig,
): Promise<string> {
  switch (service.type) {
    case 'sonarr':
      return (await getSonarrStatus(settings, service)).version
    case 'radarr':
      return (await getRadarrStatus(settings, service)).version
    case 'lidarr':
      return (await getLidarrStatus(settings, service)).version
    case 'readarr':
      return (await getReadarrStatus(settings, service)).version
    case 'whisparr':
      return (await getWhisparrStatus(settings, service)).version
    case 'sabnzbd':
      return (await getSabVersion(settings, service)).version
    case 'qbittorrent':
      return getQbitVersion(settings, service)
    case 'seerr':
      return (await getSeerrStatus(settings, service)).version
    case 'prowlarr':
      return (await getProwlarrStatus(settings, service)).version
    case 'tautulli':
      return getTautulliVersion(settings, service)
    case 'transmission':
      return getTransmissionVersion(settings, service)
    case 'nzbget':
      return getNzbgetVersion(settings, service)
    case 'deluge':
      return getDelugeVersion(settings, service)
    case 'bazarr':
      return getBazarrVersion(settings, service)
    case 'unraid':
      return getUnraidVersion(settings, service)
  }
}
