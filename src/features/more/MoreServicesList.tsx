import { Link } from 'react-router-dom'
import { ChevronRight, Server } from 'lucide-react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { serviceAccent } from '@/lib/serviceColors'
import { SERVICE_META } from '@/types/config'
import { useConfigStore } from '@/stores/configStore'

export function MoreServicesList() {
  const { isDemo, hydrated } = useConfiguredStack()
  const allServices = useConfigStore((state) => state.services)
  const services = allServices.filter((service) => service.enabled)

  if (!hydrated || isDemo || services.length === 0) return null

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Connected services"
        count={services.length}
        actionTo="/settings?focus=services"
        actionLabel="Manage"
      />
      <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
        {services.map((service) => {
          const accent = serviceAccent(service.type)
          return (
            <Link
              key={service.id}
              to={`/service/${service.id}`}
              className="group flex min-h-[var(--tap)] items-center gap-3 px-4 py-3 transition hover:bg-[var(--color-hover)]"
            >
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                  color: accent,
                }}
              >
                <Server className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--color-foreground)]">
                  {service.name}
                </span>
                <span className="block text-xs text-[var(--color-muted-foreground)]">
                  {SERVICE_META[service.type]?.label ?? service.type}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
