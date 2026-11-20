import { useMemo } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-[var(--radius-xl)]" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        compact
        title="No services connected"
        description="Add Sonarr, Radarr, Seerr, or a download client in Settings."
        actionLabel="Add service"
        actionTo="/settings?focus=services"
      />
    )
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Services"
        count={items.length}
        actionLabel="Manage"
        actionTo="/settings?focus=services"
      />
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
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
    </section>
  )
}
