import { useEffect, useState } from 'react'

import { probeService } from '@/lib/services/probe'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

export type HealthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; label: string }
  | { status: 'error'; error: string }

export function useServiceHealth(services: ServiceConfig[]) {
  const settings = useConfigStore((s) => s.settings)
  const [health, setHealth] = useState<Record<string, HealthState>>({})

  useEffect(() => {
    let cancelled = false

    async function run() {
      const next: Record<string, HealthState> = {}
      for (const service of services) {
        next[service.id] = { status: 'loading' }
      }
      if (!cancelled) setHealth(next)

      await Promise.all(
        services.map(async (service) => {
          try {
            const version = await probeService(settings, service)
            if (!cancelled) {
              setHealth((prev) => ({
                ...prev,
                [service.id]: { status: 'success', label: `v${version}` },
              }))
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unreachable'
            if (!cancelled) {
              setHealth((prev) => ({
                ...prev,
                [service.id]: { status: 'error', error: message },
              }))
            }
          }
        }),
      )
    }

    if (services.length > 0) {
      void run()
    } else {
      setHealth({})
    }

    return () => {
      cancelled = true
    }
  }, [services, settings])

  return health
}
