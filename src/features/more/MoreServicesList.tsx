import { Link } from 'react-router-dom'
import { ChevronRight, Server } from 'lucide-react'

import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { SERVICE_META } from '@/types/config'
import { useConfigStore } from '@/stores/configStore'

export function MoreServicesList() {
  const { isDemo, hydrated } = useConfiguredStack()
  const allServices = useConfigStore((state) => state.services)
  const services = allServices.filter((service) => service.enabled)

  if (!hydrated || isDemo || services.length === 0) return null

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-[var(--color-muted-foreground)]">Services</h2>
      <div className="panel overflow-hidden rounded-2xl">
        {services.map((service, index) => (
          <Link
            key={service.id}
            to={`/service/${service.id}`}
            className={`flex min-h-[var(--tap)] items-center gap-3 px-4 py-3 transition hover:bg-white/5 ${
              index < services.length - 1 ? 'border-b border-[var(--color-border)]' : ''
            }`}
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
              <Server className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{service.name}</span>
              <span className="block text-xs text-[var(--color-muted-foreground)]">
                {SERVICE_META[service.type]?.label ?? service.type}
              </span>
            </span>
            <ChevronRight className="size-4 text-[var(--color-muted-foreground)]" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  )
}
