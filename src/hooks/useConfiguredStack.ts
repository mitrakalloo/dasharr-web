import { useMemo } from 'react'

import { useConfigStore } from '@/stores/configStore'
import type { ServiceType } from '@/types/config'

/** Demo UI only when Settings has zero enabled services (after persist hydrate). */
export function useConfiguredStack() {
  const hydrated = useConfigStore((state) => state.hydrated)
  const services = useConfigStore((state) => state.services)

  return useMemo(() => {
    const enabled = services.filter((service) => service.enabled)
    const types = new Set(enabled.map((service) => service.type))
    const isDemo = hydrated && enabled.length === 0

    return {
      hydrated,
      services: enabled,
      types,
      isDemo,
      has: (type: ServiceType) => types.has(type),
      hasAny: (...list: ServiceType[]) => list.some((type) => types.has(type)),
    }
  }, [hydrated, services])
}
