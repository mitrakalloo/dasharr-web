import { useMemo } from 'react'

import { useConfigStore } from '@/stores/configStore'
import type { ServiceType } from '@/types/config'

export function useServicesByType(type: ServiceType) {
  const services = useConfigStore((s) => s.services)
  return useMemo(
    () => services.filter((service) => service.type === type && service.enabled),
    [services, type],
  )
}
