import { useCallback } from 'react'
import { toast } from 'sonner'

import { parseLiveTitleId } from '@/lib/liveTitleId'
import { updateLidarrAlbum } from '@/lib/services/lidarr.releases'
import { getLidarrAlbum } from '@/lib/services/lidarr'
import { getRadarrMovieById, updateRadarrMovie } from '@/lib/services/radarr'
import { getSonarrSeriesById, updateSonarrSeries } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'
import type { AppSettings, ServiceConfig } from '@/types/config'

export async function syncTitleMonitored(
  settings: AppSettings,
  services: ServiceConfig[],
  titleId: string,
  monitored: boolean,
): Promise<boolean> {
  const parsed = parseLiveTitleId(titleId)
  const service = parsed
    ? services.find((entry) => entry.enabled && entry.type === parsed.service)
    : undefined
  if (!parsed || !service) {
    toast.message('Connect the matching *arr service to sync monitor state')
    return false
  }

  try {
    if (parsed.service === 'sonarr') {
      const series = await getSonarrSeriesById(settings, service, parsed.numericId)
      await updateSonarrSeries(settings, service, { ...series, monitored })
    } else if (parsed.service === 'radarr') {
      const movie = await getRadarrMovieById(settings, service, parsed.numericId)
      await updateRadarrMovie(settings, service, { ...movie, monitored })
    } else if (parsed.service === 'lidarr') {
      const album = await getLidarrAlbum(settings, service, parsed.numericId)
      await updateLidarrAlbum(settings, service, { ...album, monitored })
    } else {
      return false
    }
    toast.success(monitored ? 'Monitored' : 'Unmonitored')
    return true
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Could not update monitor')
    return false
  }
}

export function useMonitorTitle(titleId: string) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const parsed = parseLiveTitleId(titleId)
  const service = parsed
    ? services.find((entry) => entry.enabled && entry.type === parsed.service)
    : undefined

  const setMonitored = useCallback(
    async (monitored: boolean) => syncTitleMonitored(settings, services, titleId, monitored),
    [services, settings, titleId],
  )

  return {
    canSync: Boolean(parsed && service),
    setMonitored,
  }
}
