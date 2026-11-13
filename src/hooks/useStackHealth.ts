import { useMemo } from 'react'

import { useServiceHealth, type HealthState } from '@/hooks/useServiceHealth'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

export type StackHealthSummary = {
  services: ServiceConfig[]
  health: Record<string, HealthState>
  online: number
  down: number
  loading: boolean
  label: string
  tone: 'ok' | 'warning'
}

export function useStackHealth(): StackHealthSummary {
  const allServices = useConfigStore((state) => state.services)
  const services = useMemo(
    () => allServices.filter((service) => service.enabled),
    [allServices],
  )
  const health = useServiceHealth(services)

  return useMemo(() => {
    if (services.length === 0) {
      return {
        services,
        health,
        online: 0,
        down: 0,
        loading: false,
        label: 'No services',
        tone: 'warning' as const,
      }
    }

    let online = 0
    let down = 0
    let loading = false

    for (const service of services) {
      const state = health[service.id]
      if (!state || state.status === 'idle' || state.status === 'loading') {
        loading = true
        continue
      }
      if (state.status === 'success') online += 1
      else down += 1
    }

    if (loading && online === 0 && down === 0) {
      return {
        services,
        health,
        online,
        down,
        loading: true,
        label: 'Checking…',
        tone: 'ok' as const,
      }
    }

    if (down > 0) {
      return {
        services,
        health,
        online,
        down,
        loading,
        label: down === 1 ? '1 Down' : `${down} Down`,
        tone: 'warning' as const,
      }
    }

    return {
      services,
      health,
      online,
      down,
      loading,
      label: 'All healthy',
      tone: 'ok' as const,
    }
  }, [services, health])
}
