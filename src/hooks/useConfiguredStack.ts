import { useMemo } from 'react'

import { useConfigStore } from '@/stores/configStore'
import type { ServiceType } from '@/types/config'

/** Stack connectivity helpers. Demo data is never auto-shown. */
export function useConfiguredStack() {
  const hydrated = useConfigStore((state) => state.hydrated)
  const services = useConfigStore((state) => state.services)

  return useMemo(() => {
    const enabled = services.filter((service) => service.enabled)
    const types = new Set(enabled.map((service) => service.type))
    const needsSetup = hydrated && enabled.length === 0

    return {
      hydrated,
      services: enabled,
      types,
      needsSetup,
      /** @deprecated Always false — kept so call sites compile while migrating */
      isDemo: false as const,
      has: (type: ServiceType) => types.has(type),
      hasAny: (...list: ServiceType[]) => list.some((type) => types.has(type)),
    }
  }, [hydrated, services])
}
