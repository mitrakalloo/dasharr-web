import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clapperboard,
  ExternalLink,
  FileInput,
  HardDrive,
  History,
  Library,
  RefreshCw,
  Rss,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  refreshMonitoredArr,
  rssSyncArr,
  searchMissingArr,
} from '@/lib/services/arr.commands'
import { getRadarrHealth } from '@/lib/services/radarr'
import { getSonarrHealth } from '@/lib/services/sonarr'
import type { ArrHealthWarning } from '@/lib/services/sonarr.types'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

interface ArrHubPanelProps {
  service: ServiceConfig
}

export function ArrHubPanel({ service }: ArrHubPanelProps) {
  const settings = useConfigStore((state) => state.settings)
  const [warnings, setWarnings] = useState<ArrHealthWarning[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const canRunCommands =
    service.type === 'sonarr' || service.type === 'radarr' || service.type === 'lidarr'

  useEffect(() => {
    if (service.type !== 'sonarr' && service.type !== 'radarr') return
    let cancelled = false
    const fetcher = service.type === 'sonarr' ? getSonarrHealth : getRadarrHealth
    fetcher(settings, service)
      .then((items) => {
        if (!cancelled) setWarnings(items)
      })
      .catch(() => {
        if (!cancelled) setWarnings([])
      })
    return () => {
      cancelled = true
    }
  }, [service, settings])

  async function trigger(kind: 'rss' | 'missing' | 'refresh') {
    setBusy(kind)
    try {
      if (kind === 'rss') await rssSyncArr(settings, service)
      else if (kind === 'missing') await searchMissingArr(settings, service)
      else await refreshMonitoredArr(settings, service)
      toast.success(
        kind === 'rss'
          ? `RSS sync queued on ${service.name}`
          : kind === 'missing'
            ? `Missing media search queued on ${service.name}`
            : `Library refresh queued on ${service.name}`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Command failed')
    } finally {
      setBusy(null)
    }
  }

  const filterParam =
    service.type === 'sonarr' || service.type === 'radarr' || service.type === 'lidarr'
      ? `?service=${service.type}`
      : ''

  const links = [
    { to: `/library${filterParam}`, label: 'Library', hint: `Browse ${service.name} titles`, icon: Library },
    { to: '/wanted', label: 'Wanted', hint: 'Missing & cutoff unmet items', icon: Clapperboard },
    { to: `/history${filterParam}`, label: 'History', hint: 'Recent grabs and imports', icon: History },
    { to: '/calendar', label: 'Schedule', hint: 'Upcoming releases', icon: Calendar },
    { to: '/manual-import', label: 'Manual import', hint: 'Import completed downloads', icon: FileInput },
    { to: '/storage', label: 'Storage', hint: 'Volumes & largest files', icon: HardDrive },
  ]

  return (
    <div className="space-y-6">
      {warnings.length > 0 ? (
        <section className="space-y-2.5">
          <SectionHeader
            title="Health warnings"
            count={warnings.length}
          />
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div
                key={`${warning.source}-${idx}`}
                className="flex items-start justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)]/60 p-3.5"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" aria-hidden />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{warning.source}</span>
                      <Badge tone={warning.type === 'error' ? 'danger' : 'warning'}>
                        {warning.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-foreground)]">
                      {warning.message}
                    </p>
                  </div>
                </div>
                {warning.wikiUrl ? (
                  <a
                    href={warning.wikiUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open wiki"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {canRunCommands ? (
        <section className="panel space-y-3 rounded-[var(--radius-2xl)] p-5">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              Service commands
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Run background tasks directly on {service.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'rss'}
              onClick={() => void trigger('rss')}
            >
              <Rss className="size-3.5" aria-hidden />
              RSS sync
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'missing'}
              onClick={() => void trigger('missing')}
            >
              <Search className="size-3.5" aria-hidden />
              Search missing
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'refresh'}
              onClick={() => void trigger('refresh')}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Refresh monitored
            </Button>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionHeader title="Quick tools" />
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.to}
                to={link.to}
                className="group flex min-h-[var(--tap)] items-center gap-3 px-4 py-3.5 transition hover:bg-[var(--color-hover)]"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--color-foreground)]">
                    {link.label}
                  </span>
                  <span className="block text-xs text-[var(--color-muted-foreground)]">
                    {link.hint}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
                  aria-hidden
                />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
