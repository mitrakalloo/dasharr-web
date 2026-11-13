import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import {
  mapArrQueueItem,
  mapQbitTorrent,
  mapSabSlot,
} from '@/features/queue/queue.mappers'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { usePolling } from '@/hooks/usePolling'
import { getQbitTorrents, qbitPause, qbitResume } from '@/lib/services/qbittorrent'
import { getRadarrQueue } from '@/lib/services/radarr'
import { getSabQueue, sabPause, sabResume } from '@/lib/services/sabnzbd'
import { getSonarrQueue } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

async function fetchQueue(
  settings: ReturnType<typeof useConfigStore.getState>['settings'],
  services: ServiceConfig[],
): Promise<DemoQueueItem[]> {
  const settled = await Promise.allSettled(
    services.map(async (service) => {
      if (service.type === 'qbittorrent') {
        const torrents = await getQbitTorrents(settings, service)
        return torrents.map((torrent) => mapQbitTorrent(torrent, service.id))
      }
      if (service.type === 'sabnzbd') {
        const queue = await getSabQueue(settings, service)
        return (queue?.slots ?? []).map((slot) => mapSabSlot(slot, service.id, queue))
      }
      if (service.type === 'sonarr') {
        const items = await getSonarrQueue(settings, service)
        return items.map((item) => mapArrQueueItem(item, 'sonarr'))
      }
      if (service.type === 'radarr') {
        const items = await getRadarrQueue(settings, service)
        return items.map((item) => mapArrQueueItem(item, 'radarr'))
      }
      return [] as DemoQueueItem[]
    }),
  )

  return settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
}

export function useDownloadQueue(enabled: boolean) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)

  const sources = useMemo(
    () =>
      services.filter(
        (service) =>
          service.enabled &&
          (service.type === 'qbittorrent' ||
            service.type === 'sabnzbd' ||
            service.type === 'sonarr' ||
            service.type === 'radarr'),
      ),
    [services],
  )

  const key = `${sources.map((service) => service.id).join(',')}:${settings.connectionMode}`
  const state = usePolling(
    key,
    () => fetchQueue(settings, sources),
    5000,
    enabled && sources.length > 0,
  )

  const pauseOrResume = useCallback(
    async (item: DemoQueueItem, resume: boolean) => {
      if (!item.clientServiceId || !item.clientItemId || !item.canPause) return
      const service = services.find((entry) => entry.id === item.clientServiceId)
      if (!service) return

      try {
        if (service.type === 'qbittorrent') {
          if (resume) await qbitResume(settings, service, item.clientItemId)
          else await qbitPause(settings, service, item.clientItemId)
        } else if (service.type === 'sabnzbd') {
          if (resume) await sabResume(settings, service, item.clientItemId)
          else await sabPause(settings, service, item.clientItemId)
        }
        toast.success(resume ? 'Resumed' : 'Paused')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Action failed')
      }
    },
    [services, settings],
  )

  return {
    ...state,
    items: state.status === 'success' ? state.data : [],
    activeCount:
      state.status === 'success'
        ? state.data.filter((item) => item.status === 'downloading').length
        : 0,
    pauseOrResume,
    hasSources: sources.length > 0,
  }
}
