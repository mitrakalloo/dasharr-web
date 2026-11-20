import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Compass, HardDrive, Tv } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useTautulliSessions } from '@/hooks/useTautulliSessions'
import { serviceAccent } from '@/lib/serviceColors'
import { getUnraidSnapshot } from '@/lib/services/unraid'
import { titlePath } from '@/data/demoTitles'
import { useConfigStore } from '@/stores/configStore'

export function HomeTorrentQueueWidget() {
  const { isDemo, hasAny } = useConfiguredStack()
  const queue = useDownloadQueue(
    !isDemo && hasAny('qbittorrent', 'transmission', 'deluge'),
  )
  const torrents = queue.items
    .filter(
      (item) =>
        item.service === 'qbittorrent' ||
        item.service === 'transmission' ||
        item.service === 'deluge',
    )
    .slice(0, 5)

  if (isDemo || !hasAny('qbittorrent', 'transmission', 'deluge')) return null

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Torrent queue"
        count={torrents.length}
        actionLabel="Queue"
        actionTo="/queue"
      />
      {torrents.length === 0 ? (
        <EmptyState compact title="No active torrents" description="Torrent clients are idle." />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {torrents.map((item) => {
            const target = item.titleId ? titlePath(item.titleId) : '/queue?filter=downloading'
            return (
              <Link
                key={item.id}
                to={target}
                className="magnetic panel group block space-y-2 rounded-[var(--radius-xl)] px-3.5 py-3 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium group-hover:text-[var(--color-primary)]">
                    {item.title}
                  </p>
                  <span className="tabular shrink-0 text-xs font-semibold text-[var(--color-primary)]">
                    {item.progress}%
                  </span>
                </div>
                <ProgressBar
                  value={item.progress}
                  color={serviceAccent(item.service)}
                  live={item.status === 'downloading'}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="tabular text-xs text-[var(--color-muted-foreground)]">
                    {item.speed} · {item.eta}
                  </p>
                  <ChevronRight
                    className="size-3.5 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                    aria-hidden
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function HomeTautulliStatsWidget() {
  const { isDemo, has } = useConfiguredStack()
  const watching = useTautulliSessions(!isDemo && has('tautulli'))
  if (isDemo || !has('tautulli')) return null
  return (
    <Link
      to="/activity"
      className="magnetic panel group flex items-center justify-between gap-4 rounded-[var(--radius-2xl)] px-4 py-3.5 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-info)]/25 bg-[var(--color-info-muted)] text-[var(--color-info)]">
          <Tv className="size-4.5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold tracking-tight">Tautulli</h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Active streams, history & stats
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="tabular text-2xl font-semibold text-[var(--color-info)]">
          {watching.items.length}
        </p>
        <ChevronRight
          className="size-4 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
          aria-hidden
        />
      </div>
    </Link>
  )
}

export function HomeUnraidSnapshotWidget() {
  const { isDemo, has } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const unraid = useConfigStore((state) =>
    state.services.find((service) => service.type === 'unraid' && service.enabled),
  )
  const [snapshot, setSnapshot] = useState<{
    state: string
    pct: number
    containers: number
    error?: boolean
  } | null>(null)

  useEffect(() => {
    if (!unraid || isDemo) return
    let cancelled = false
    void getUnraidSnapshot(settings, unraid)
      .then((data) => {
        if (cancelled) return
        const used = Number(data.capacity?.used ?? 0)
        const total = Number(data.capacity?.total ?? 0)
        const pct = total > 0 ? Math.round((used / total) * 100) : 0
        setSnapshot({
          state: data.state,
          pct,
          containers: data.containers.length,
        })
      })
      .catch(() => {
        if (!cancelled) setSnapshot({ state: 'Unavailable', pct: 0, containers: 0, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [unraid, isDemo, settings])

  if (isDemo || !has('unraid') || !unraid) return null

  return (
    <Link
      to={`/service/${unraid.id}`}
      className="magnetic panel group block space-y-3 rounded-[var(--radius-2xl)] p-4 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-warning)]/25 bg-[var(--color-warning-muted)] text-[var(--color-warning)]">
            <HardDrive className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight">
              {unraid.name || 'Unraid'}
            </h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {!snapshot
                ? 'Checking array status…'
                : snapshot.error
                  ? 'Unavailable'
                  : `${snapshot.state} · ${snapshot.containers} containers`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {snapshot && !snapshot.error ? (
            <span className="tabular text-sm font-semibold text-[var(--color-foreground)]">
              {snapshot.pct}%
            </span>
          ) : null}
          <ChevronRight
            className="size-4 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
            aria-hidden
          />
        </div>
      </div>
      {snapshot && !snapshot.error ? (
        <ProgressBar
          value={snapshot.pct}
          animated
          color={
            snapshot.pct > 85
              ? 'var(--color-destructive)'
              : snapshot.pct > 70
                ? 'var(--color-warning)'
                : serviceAccent('unraid')
          }
        />
      ) : null}
    </Link>
  )
}

export function HomeHouseholdRecsWidget() {
  const { isDemo, has } = useConfiguredStack()
  if (isDemo || !has('seerr') || !has('tautulli')) return null
  return (
    <Link
      to="/discover"
      className="magnetic panel group flex items-center justify-between gap-4 rounded-[var(--radius-2xl)] p-4 active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)]/25 bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
          <Compass className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-sm font-semibold tracking-tight">For your household</h2>
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
            Browse Discover to request titles inspired by recent viewing
          </p>
        </div>
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
        aria-hidden
      />
    </Link>
  )
}
