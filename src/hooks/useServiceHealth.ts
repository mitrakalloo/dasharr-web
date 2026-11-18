import { useEffect, useState } from 'react'

import { apiJson } from '@/lib/api/server'
import type { ServiceConfig } from '@/types/config'

export type HealthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; label: string }
  | { status: 'error'; error: string }

type HealthPayload = {
  services: Array<{
    id: string
    status: 'success' | 'error'
    version?: string
    error?: string
  }>
}

export function useServiceHealth(services: ServiceConfig[]) {
  const [health, setHealth] = useState<Record<string, HealthState>>({})
  const ids = services.map((service) => service.id).join(',')

  useEffect(() => {
    let cancelled = false
    if (services.length === 0) {
      setHealth({})
      return
    }

    const loading: Record<string, HealthState> = {}
    for (const service of services) loading[service.id] = { status: 'loading' }
    setHealth(loading)

    async function run() {
      try {
        const payload = await apiJson<HealthPayload>('/api/services/health')
        if (cancelled) return
        const next: Record<string, HealthState> = {}
        for (const service of services) {
          const row = payload.services.find((item) => item.id === service.id)
          if (!row) {
            next[service.id] = { status: 'error', error: 'Missing' }
          } else if (row.status === 'success') {
            next[service.id] = { status: 'success', label: `v${row.version ?? 'ok'}` }
          } else {
            next[service.id] = { status: 'error', error: row.error ?? 'Unreachable' }
          }
        }
        setHealth(next)
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Health check failed'
        const next: Record<string, HealthState> = {}
        for (const service of services) {
          next[service.id] = { status: 'error', error: message }
        }
        setHealth(next)
      }
    }

    void run()
    const timer = window.setInterval(() => void run(), 30_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [ids, services])

  return health
}
