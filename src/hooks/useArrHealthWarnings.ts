import { useMemo } from 'react'

import { usePolling } from '@/hooks/usePolling'
import { getRadarrHealth } from '@/lib/services/radarr'
import { getSonarrHealth } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceType } from '@/types/config'

export interface ArrHealthItem {
  id: string
  serviceId: string
  serviceName: string
  serviceType: ServiceType
  type: 'error' | 'warning' | 'notice' | 'ok'
  source: string
  message: string
  wikiUrl?: string
}

export function useArrHealthWarnings(enabled = true) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)

  const arrServices = useMemo(
    () =>
      services.filter(
        (service) =>
          service.enabled && (service.type === 'sonarr' || service.type === 'radarr'),
      ),
    [services],
  )

  const key = arrServices.map((s) => s.id).join(',')

  const state = usePolling(
    `arr-health:${key}`,
    async () => {
      const settled = await Promise.allSettled(
        arrServices.map(async (service) => {
          const items =
            service.type === 'sonarr'
              ? await getSonarrHealth(settings, service)
              : await getRadarrHealth(settings, service)
          return items.map(
            (item, idx): ArrHealthItem => ({
              id: `${service.id}-${item.source}-${idx}`,
              serviceId: service.id,
              serviceName: service.name || service.type,
              serviceType: service.type,
              type:
                item.type === 'error' ||
                item.type === 'warning' ||
                item.type === 'notice' ||
                item.type === 'ok'
                  ? item.type
                  : 'warning',
              source: item.source,
              message: item.message,
              wikiUrl: item.wikiUrl,
            }),
          )
        }),
      )
      return settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    60_000,
    enabled && arrServices.length > 0,
  )

  const warnings = useMemo(
    () => (state.status === 'success' ? state.data : []),
    [state],
  )

  return {
    ...state,
    warnings,
    count: warnings.length,
  }
}
