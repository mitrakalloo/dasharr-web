import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { mapTautulliSession } from '@/features/queue/queue.mappers'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { usePolling } from '@/hooks/usePolling'
import { getTautulliSessions, terminateTautulliSession } from '@/lib/services/tautulli'
import { useConfigStore } from '@/stores/configStore'

export function useTautulliSessions(enabled: boolean) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)

  const sources = useMemo(
    () => services.filter((service) => service.enabled && service.type === 'tautulli'),
    [services],
  )

  const key = `${sources.map((service) => service.id).join(',')}:${settings.connectionMode}`
  const state = usePolling(
    key,
    async () => {
      const settled = await Promise.allSettled(
        sources.map(async (service) => {
          const sessions = await getTautulliSessions(settings, service)
          return sessions.map((session, index) =>
            mapTautulliSession(session, service.id, index),
          )
        }),
      )
      return settled.flatMap((result) =>
        result.status === 'fulfilled' ? result.value : [],
      ) as DemoQueueItem[]
    },
    8000,
    enabled && sources.length > 0,
  )

  const terminate = useCallback(
    async (item: DemoQueueItem) => {
      if (!item.clientServiceId || !item.clientItemId) return
      const service = services.find((entry) => entry.id === item.clientServiceId)
      if (!service) return
      try {
        await terminateTautulliSession(settings, service, item.clientItemId)
        toast.success('Session terminated')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Terminate failed')
      }
    },
    [services, settings],
  )

  return {
    ...state,
    items: state.status === 'success' ? state.data : [],
    hasSources: sources.length > 0,
    terminate,
  }
}
