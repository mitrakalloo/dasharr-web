import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  Clapperboard,
  ExternalLink,
  History,
  Library,
  FileInput,
} from 'lucide-react'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { probeService } from '@/lib/services/probe'
import { effectiveServiceUrl, SERVICE_META } from '@/types/config'
import { useConfigStore } from '@/stores/configStore'

const ARR_LINKS = [
  { to: '/library', label: 'Library', icon: Library },
  { to: '/wanted', label: 'Wanted', icon: Clapperboard },
  { to: '/history', label: 'History', icon: History },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/manual-import', label: 'Manual import', icon: FileInput },
] as const

export function ServiceHubPage() {
  const { id } = useParams<{ id: string }>()
  const { isDemo, hydrated } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const service = useConfigStore((state) => state.services.find((entry) => entry.id === id))
  const [version, setVersion] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!service || isDemo) return
    let cancelled = false
    void probeService(settings, service)
      .then((value) => {
        if (!cancelled) {
          setVersion(value)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setVersion(null)
          setError(err instanceof Error ? err.message : 'Probe failed')
        }
      })
    return () => {
      cancelled = true
    }
  }, [service, settings, isDemo])

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  if (!service) {
    return (
      <div>
        <SubpageHeader title="Service" backTo="/more" />
        <div className="px-4 pt-4">
          <EmptyState title="Service not found" description="It may have been removed." />
        </div>
      </div>
    )
  }

  const meta = SERVICE_META[service.type]
  const url = effectiveServiceUrl(service)
  const isArr =
    service.type === 'sonarr' ||
    service.type === 'radarr' ||
    service.type === 'lidarr' ||
    service.type === 'readarr' ||
    service.type === 'whisparr'

  return (
    <div>
      <SubpageHeader title={service.name} subtitle={meta.label} backTo="/more" />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <div className="panel rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Status
          </p>
          <p className="mt-1 text-sm">
            {isDemo
              ? 'Demo mode'
              : error
                ? `Offline · ${error}`
                : version
                  ? `Online · v${version}`
                  : 'Checking…'}
          </p>
          <p className="mt-2 truncate text-xs text-[var(--color-muted-foreground)]">{url}</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-[var(--tap)] items-center gap-2 text-sm font-medium text-[var(--color-secondary)]"
          >
            Open service <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>

        {isArr ? (
          <div className="panel overflow-hidden rounded-2xl">
            {ARR_LINKS.map((link, index) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex min-h-[var(--tap)] items-center gap-3 px-4 py-3 transition hover:bg-white/5 ${
                    index < ARR_LINKS.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                  }`}
                >
                  <Icon className="size-5 text-[var(--color-primary)]" aria-hidden />
                  <span className="text-sm font-semibold">{link.label}</span>
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
