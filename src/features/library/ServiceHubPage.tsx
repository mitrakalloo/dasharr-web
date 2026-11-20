import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Activity,
  Captions,
  ChevronRight,
  Compass,
  ExternalLink,
  Inbox,
  Server,
} from 'lucide-react'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { ArrHubPanel } from '@/features/services/ArrHubPanel'
import { DownloadClientHubPanel } from '@/features/services/DownloadClientHubPanel'
import { ProwlarrHubPanel } from '@/features/services/ProwlarrHubPanel'
import { UnraidHubPanel } from '@/features/services/UnraidHubPanel'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { serviceAccent } from '@/lib/serviceColors'
import { probeService } from '@/lib/services/probe'
import { useConfigStore } from '@/stores/configStore'
import { effectiveServiceUrl, SERVICE_META } from '@/types/config'

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
    return <PageSkeleton variant="list" />
  }

  if (!service) {
    return (
      <div>
        <SubpageHeader
          title="Service"
          backTo="/more"
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'More', to: '/more' }, { label: 'Service' }]}
        />
        <div className="page-pad">
          <EmptyState
            icon={<Server className="size-5" aria-hidden="true" />}
            title="Service not found"
            description="This service may have been removed or disabled."
            actionLabel="Back to More"
            actionTo="/more"
          />
        </div>
      </div>
    )
  }

  const meta = SERVICE_META[service.type]
  const accent = serviceAccent(service.type)
  const url = effectiveServiceUrl(service)
  const isArr =
    service.type === 'sonarr' ||
    service.type === 'radarr' ||
    service.type === 'lidarr' ||
    service.type === 'readarr' ||
    service.type === 'whisparr'
  const isDownloadClient =
    service.type === 'qbittorrent' ||
    service.type === 'sabnzbd' ||
    service.type === 'transmission' ||
    service.type === 'deluge' ||
    service.type === 'nzbget'

  const statusTone = isDemo
    ? 'neutral'
    : error
      ? 'danger'
      : version
        ? 'success'
        : 'warning'

  const statusLabel = isDemo
    ? 'Demo mode'
    : error
      ? 'Offline'
      : version
        ? `Online · v${version}`
        : 'Checking…'

  return (
    <div>
      <SubpageHeader
        title={service.name}
        subtitle={meta.label}
        backTo="/more"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/more' },
          { label: service.name || meta.label },
        ]}
      />
      <div className="page-pad space-y-6">
        <div className="panel rounded-[var(--radius-2xl)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <span
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                  color: accent,
                }}
              >
                <Server className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                    {service.name}
                  </h2>
                  <Badge tone={statusTone} dot>
                    {statusLabel}
                  </Badge>
                </div>
                <p className="mt-1 truncate font-mono text-xs text-[var(--color-muted-foreground)]">
                  {url}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link to="/settings?focus=services">
                <Button size="sm" variant="ghost">
                  Configure
                </Button>
              </Link>
              <a href={url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary">
                  Open web UI
                  <ExternalLink className="size-3.5" />
                </Button>
              </a>
            </div>
          </div>

          {error ? (
            <p className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-destructive)]/25 bg-[var(--color-destructive-muted)] px-3 py-2 text-xs text-[var(--color-destructive)]">
              {error}
            </p>
          ) : null}
        </div>

        {service.type === 'unraid' ? <UnraidHubPanel service={service} /> : null}
        {isDownloadClient ? <DownloadClientHubPanel service={service} /> : null}
        {service.type === 'prowlarr' ? <ProwlarrHubPanel service={service} /> : null}
        {isArr ? <ArrHubPanel service={service} /> : null}

        {service.type === 'bazarr' ? (
          <Link
            to="/subtitles"
            className="magnetic panel group flex items-center justify-between gap-4 rounded-[var(--radius-2xl)] p-5"
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                <Captions className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold tracking-tight">
                  Open Subtitles Manager
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Inspect missing episode & movie subtitles and trigger one-tap searches
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" />
          </Link>
        ) : null}

        {service.type === 'tautulli' ? (
          <Link
            to="/activity"
            className="magnetic panel group flex items-center justify-between gap-4 rounded-[var(--radius-2xl)] p-5"
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[var(--color-info-muted)] text-[var(--color-info)]">
                <Activity className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold tracking-tight">
                  Open Activity & Stats
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Monitor live Plex streams, watch history, and 30-day household insights
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" />
          </Link>
        ) : null}

        {service.type === 'seerr' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/requests"
              className="magnetic panel group flex items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-4"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                  <Inbox className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold">Requests</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">Approve & manage queue</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/discover"
              className="magnetic panel group flex items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-4"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                  <Compass className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold">Discover</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">Trending movies & TV</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
