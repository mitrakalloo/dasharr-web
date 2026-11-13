import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { ServiceStatusCard } from '@/features/overview/ServiceStatusCard'
import { DEMO_SERVICES, type DemoServiceStatus } from '@/data/demoDashboard'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useStackHealth } from '@/hooks/useStackHealth'
import type { HealthState } from '@/hooks/useServiceHealth'

interface ServiceStatusStripProps {
  activeId?: string
  onSelect?: (id: string) => void
}

function detailFromHealth(state: HealthState | undefined): { online: boolean; detail: string } {
  if (!state || state.status === 'idle' || state.status === 'loading') {
    return { online: true, detail: 'Checking…' }
  }
  if (state.status === 'success') {
    return { online: true, detail: state.label }
  }
  return { online: false, detail: state.error }
}

export function ServiceStatusStrip({ activeId, onSelect }: ServiceStatusStripProps) {
  const { isDemo, hydrated } = useConfiguredStack()
  const { services, health } = useStackHealth()

  const items = useMemo((): DemoServiceStatus[] => {
    if (!hydrated) return []
    if (isDemo) return DEMO_SERVICES

    return services.map((service) => {
      const { online, detail } = detailFromHealth(health[service.id])
      return {
        id: service.id,
        type: service.type,
        name: service.name,
        online,
        queueCount: 0,
        detail,
      }
    })
  }, [hydrated, isDemo, services, health])

  if (!hydrated) {
    return (
      <div className="px-4 text-sm text-[var(--color-muted-foreground)]">Loading services…</div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center">
        <p className="text-sm font-medium">No services yet</p>
        <Link to="/settings" className="mt-2 inline-flex min-h-[var(--tap)] items-center text-sm text-[var(--color-accent)]">
          Add one in Settings
        </Link>
      </div>
    )
  }

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {items.map((service, index) => (
        <ServiceStatusCard
          key={service.id}
          service={service}
          index={index}
          selected={activeId === service.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
