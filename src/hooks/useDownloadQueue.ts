import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import {
  mapArrQueueItem,
  mapDelugeTorrent,
  mapNzbgetGroup,
  mapQbitTorrent,
  mapSabSlot,
  mapTransmissionTorrent,
} from '@/features/queue/queue.mappers'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { usePolling } from '@/hooks/usePolling'
import {
  delugePause,
  delugeRemove,
  delugeResume,
  getDelugeTorrents,
} from '@/lib/services/deluge'
import {
  getNzbgetGroups,
  nzbgetDelete,
  nzbgetPause,
  nzbgetResume,
} from '@/lib/services/nzbget'
import {
  getQbitTorrents,
  qbitDelete,
  qbitForceRetry,
  qbitPause,
  qbitResume,
} from '@/lib/services/qbittorrent'
import { deleteRadarrQueueItem, getRadarrQueue } from '@/lib/services/radarr'
import { getSabQueue, sabDelete, sabForceRetry, sabPause, sabResume } from '@/lib/services/sabnzbd'
import { deleteSonarrQueueItem, getSonarrQueue } from '@/lib/services/sonarr'
import {
  getTransmissionTorrents,
  transmissionPause,
  transmissionRemove,
  transmissionResume,
} from '@/lib/services/transmission'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

const DOWNLOAD_TYPES = new Set([
  'qbittorrent',
  'sabnzbd',
  'sonarr',
  'radarr',
  'transmission',
  'nzbget',
  'deluge',
])

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
      if (service.type === 'transmission') {
        const torrents = await getTransmissionTorrents(settings, service)
        return torrents.map((torrent) => mapTransmissionTorrent(torrent, service.id))
      }
      if (service.type === 'nzbget') {
        const groups = await getNzbgetGroups(settings, service)
        return groups.map((group) => mapNzbgetGroup(group, service.id))
      }
      if (service.type === 'deluge') {
        const torrents = await getDelugeTorrents(settings, service)
        return torrents.map((torrent) => mapDelugeTorrent(torrent, service.id))
      }
      if (service.type === 'sonarr') {
        const items = await getSonarrQueue(settings, service)
        return items.map((item) => mapArrQueueItem(item, 'sonarr', service.id))
      }
      if (service.type === 'radarr') {
        const items = await getRadarrQueue(settings, service)
        return items.map((item) => mapArrQueueItem(item, 'radarr', service.id))
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
    () => services.filter((service) => service.enabled && DOWNLOAD_TYPES.has(service.type)),
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
      if (!item.clientServiceId || !item.clientItemId || !item.canPause) {
        toast.message('Pause isn’t available for this download source')
        return
      }
      const service = services.find((entry) => entry.id === item.clientServiceId)
      if (!service) return

      try {
        if (service.type === 'qbittorrent') {
          if (resume) await qbitResume(settings, service, item.clientItemId)
          else await qbitPause(settings, service, item.clientItemId)
        } else if (service.type === 'sabnzbd') {
          if (resume) await sabResume(settings, service, item.clientItemId)
          else await sabPause(settings, service, item.clientItemId)
        } else if (service.type === 'transmission') {
          const id = Number(item.clientItemId)
          if (resume) await transmissionResume(settings, service, [id])
          else await transmissionPause(settings, service, [id])
        } else if (service.type === 'nzbget') {
          const id = Number(item.clientItemId)
          if (resume) await nzbgetResume(settings, service, id)
          else await nzbgetPause(settings, service, id)
        } else if (service.type === 'deluge') {
          if (resume) await delugeResume(settings, service, [item.clientItemId])
          else await delugePause(settings, service, [item.clientItemId])
        } else {
          toast.message('Pause isn’t available for this download source')
          return
        }
        toast.success(resume ? 'Resumed' : 'Paused')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Action failed')
      }
    },
    [services, settings],
  )

  const retryItem = useCallback(
    async (item: DemoQueueItem) => {
      if (!item.clientServiceId || !item.clientItemId || !item.canRetry) {
        toast.message('Force retry isn’t available for this download source')
        return
      }
      const service = services.find((entry) => entry.id === item.clientServiceId)
      if (!service) return
      try {
        if (service.type === 'qbittorrent') {
          await qbitForceRetry(settings, service, item.clientItemId)
        } else if (service.type === 'sabnzbd') {
          await sabForceRetry(settings, service, item.clientItemId)
        } else {
          toast.message('Force retry isn’t available for this download source')
          return
        }
        toast.success('Force retry sent')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Retry failed')
      }
    },
    [services, settings],
  )

  const removeItem = useCallback(
    async (item: DemoQueueItem) => {
      if (!item.clientServiceId || !item.clientItemId || !item.canRemove) {
        toast.message('Remove isn’t available for this download source')
        return
      }
      const service = services.find((entry) => entry.id === item.clientServiceId)
      if (!service) return

      try {
        if (service.type === 'qbittorrent') {
          await qbitDelete(settings, service, item.clientItemId, false)
        } else if (service.type === 'sabnzbd') {
          await sabDelete(settings, service, item.clientItemId)
        } else if (service.type === 'transmission') {
          await transmissionRemove(settings, service, [Number(item.clientItemId)])
        } else if (service.type === 'nzbget') {
          await nzbgetDelete(settings, service, Number(item.clientItemId))
        } else if (service.type === 'deluge') {
          await delugeRemove(settings, service, [item.clientItemId])
        } else if (service.type === 'sonarr') {
          await deleteSonarrQueueItem(settings, service, Number(item.clientItemId))
        } else if (service.type === 'radarr') {
          await deleteRadarrQueueItem(settings, service, Number(item.clientItemId))
        } else {
          toast.message('Remove isn’t available for this download source')
          return
        }
        toast.success('Removed from queue')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Remove failed')
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
    retryItem,
    removeItem,
    hasSources: sources.length > 0,
    updatedAt: state.status === 'success' ? state.updatedAt : undefined,
  }
}
