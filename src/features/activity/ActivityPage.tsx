import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  ChevronRight,
  Clock,
  Globe,
  RefreshCw,
  Tv,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useLibraryBrowse } from '@/hooks/useLibraryBrowse'
import { useTautulliSessions } from '@/hooks/useTautulliSessions'
import {
  getTautulliHistory,
  getTautulliHomeStats,
  type TautulliHistoryEntry,
  type TautulliHomeStat,
} from '@/lib/services/tautulli'
import { titlePath } from '@/data/demoTitles'
import { useConfigStore } from '@/stores/configStore'
import type { DemoQueueItem } from '@/data/demoDashboard'

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return ''
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

export function ActivityPage() {
  const { hydrated, has } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const tautulli = useConfigStore((state) =>
    state.services.find((s) => s.enabled && s.type === 'tautulli'),
  )
  const sessions = useTautulliSessions(Boolean(tautulli))
  const library = useLibraryBrowse(Boolean(tautulli))

  const [history, setHistory] = useState<TautulliHistoryEntry[]>([])
  const [stats, setStats] = useState<TautulliHomeStat[]>([])
  const [loadingExtra, setLoadingExtra] = useState(false)
  const [terminateTarget, setTerminateTarget] = useState<DemoQueueItem | null>(null)

  const loadExtra = useCallback(async () => {
    if (!tautulli) return
    setLoadingExtra(true)
    try {
      const [hist, homeStats] = await Promise.all([
        getTautulliHistory(settings, tautulli, 25).catch(() => []),
        getTautulliHomeStats(settings, tautulli).catch(() => []),
      ])
      setHistory(hist)
      setStats(homeStats.filter((stat) => stat.rows && stat.rows.length > 0))
    } finally {
      setLoadingExtra(false)
    }
  }, [settings, tautulli])

  useEffect(() => {
    void loadExtra()
  }, [loadExtra])

  const libraryByTitle = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of library.items) {
      map.set(item.title.toLowerCase(), item.titleId)
    }
    return map
  }, [library.items])

  function destinationForTitle(rawTitle?: string): string {
    if (!rawTitle) return '/search'
    const normalized = rawTitle.trim().toLowerCase()
    const match = libraryByTitle.get(normalized)
    if (match) return titlePath(match)
    return `/search?q=${encodeURIComponent(rawTitle)}`
  }

  if (!hydrated) return <PageSkeleton variant="grid" />

  return (
    <div className="page-pad space-y-6">
      <PageHeader
        eyebrow="Tautulli"
        title="Activity & Stats"
        description={
          tautulli
            ? `${sessions.items.length} active ${sessions.items.length === 1 ? 'stream' : 'streams'} · 30-day viewing insights`
            : 'Monitor live Plex streams, watch history, and server analytics'
        }
        actions={
          tautulli ? (
            <Button
              variant="secondary"
              size="sm"
              loading={loadingExtra}
              onClick={() => {
                sessions.refresh()
                void loadExtra()
              }}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Refresh
            </Button>
          ) : undefined
        }
      />

      {!has('tautulli') || !tautulli ? (
        <EmptyState
          icon={<Activity className="size-5" aria-hidden />}
          title="Connect Tautulli"
          description="Add Tautulli in Settings to monitor live streams, transcode states, watch history, and 30-day stats."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      ) : (
        <>
          <section className="space-y-3">
            <SectionHeader
              title="Live streams"
              count={sessions.items.length}
            />
            {sessions.items.length === 0 ? (
              <EmptyState
                compact
                icon={<Tv className="size-5" aria-hidden />}
                title="No active streams"
                description="Live Plex sessions will appear here automatically."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {sessions.items.map((session) => (
                  <div
                    key={session.id}
                    className="panel space-y-3 rounded-[var(--radius-2xl)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge tone="info" dot>
                            {session.quality || 'Streaming'}
                          </Badge>
                          {session.speed ? <Badge tone="neutral">{session.speed}</Badge> : null}
                        </div>
                        <Link
                          to={destinationForTitle(session.title)}
                          className="mt-1.5 block truncate text-base font-semibold tracking-tight hover:text-[var(--color-primary)]"
                        >
                          {session.title}
                        </Link>
                        <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                          {session.subtitle}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTerminateTarget(session)}
                        aria-label={`Terminate ${session.title}`}
                      >
                        <XCircle className="size-4 text-[var(--color-destructive)]" aria-hidden />
                      </Button>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="tabular font-semibold">{session.progress}%</span>
                        <span className="text-[var(--color-muted-foreground)]">{session.eta}</span>
                      </div>
                      <ProgressBar value={session.progress} color="var(--color-info)" live />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {stats.length > 0 ? (
            <section className="space-y-3">
              <SectionHeader
                title="30-day highlights"
                description="Top titles and viewers from Tautulli"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {stats.slice(0, 6).map((stat) => (
                  <div
                    key={stat.stat_id}
                    className="panel space-y-2.5 rounded-[var(--radius-2xl)] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-[var(--color-primary)]" aria-hidden />
                      <h3 className="font-display text-sm font-semibold tracking-tight">
                        {stat.stat_title}
                      </h3>
                    </div>
                    <div className="divide-y divide-[var(--color-hairline)]">
                      {stat.rows.slice(0, 5).map((row, idx) => {
                        const titleLabel = row.title || row.friendly_name || row.user || 'Item'
                        const isTitleStat = Boolean(row.title)
                        const content = (
                          <div className="flex items-center justify-between gap-2 py-2 text-xs">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="tabular w-4 text-[var(--color-muted-foreground)]">
                                {idx + 1}.
                              </span>
                              <span className="truncate font-medium text-[var(--color-foreground)]">
                                {titleLabel}
                              </span>
                            </span>
                            <span className="tabular shrink-0 text-[var(--color-muted-foreground)]">
                              {row.total_plays !== undefined
                                ? `${row.total_plays} plays`
                                : row.total_duration
                                  ? formatDuration(row.total_duration)
                                  : ''}
                            </span>
                          </div>
                        )
                        return isTitleStat ? (
                          <Link
                            key={`${stat.stat_id}-${idx}`}
                            to={destinationForTitle(row.title)}
                            className="block rounded transition-colors hover:bg-[var(--color-hover)] hover:px-1.5"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={`${stat.stat_id}-${idx}`}>{content}</div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <SectionHeader
              title="Recent watch history"
              count={history.length}
            />
            {loadingExtra && history.length === 0 ? (
              <div className="space-y-2">
                <div className="skeleton h-14 rounded-[var(--radius-xl)]" />
                <div className="skeleton h-14 rounded-[var(--radius-xl)]" />
              </div>
            ) : history.length === 0 ? (
              <EmptyState
                compact
                icon={<Clock className="size-5" aria-hidden />}
                title="No recent watch history"
                description="Completed and in-progress views will appear here."
              />
            ) : (
              <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
                {history.map((entry, idx) => {
                  const lookupName = entry.grandparent_title || entry.title || entry.full_title
                  const displayTitle = entry.full_title || entry.title || 'Unknown title'
                  const when = entry.started
                    ? new Date(entry.started * 1000).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''
                  const isTranscode = (entry.transcode_decision ?? '').toLowerCase().includes('transcode')

                  return (
                    <Link
                      key={`${entry.id ?? entry.reference_id ?? idx}-${idx}`}
                      to={destinationForTitle(lookupName)}
                      className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-hover)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                          {displayTitle}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
                          {entry.friendly_name || entry.user || 'User'}
                          {entry.player ? ` · ${entry.player}` : ''}
                          {when ? ` · ${when}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {entry.transcode_decision ? (
                          <Badge tone={isTranscode ? 'warning' : 'success'} className="hidden sm:inline-flex">
                            <Globe className="mr-1 inline size-3" aria-hidden />
                            {isTranscode ? 'Transcode' : 'Direct'}
                          </Badge>
                        ) : null}
                        {entry.percent_complete !== undefined ? (
                          <span className="tabular text-xs font-medium text-[var(--color-muted-foreground)]">
                            {Math.round(entry.percent_complete)}%
                          </span>
                        ) : null}
                        <ChevronRight className="size-4 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={Boolean(terminateTarget)}
        title="Terminate stream"
        description={
          terminateTarget
            ? `Stop active Plex playback of “${terminateTarget.title}”?`
            : ''
        }
        confirmLabel="Terminate"
        tone="danger"
        onClose={() => setTerminateTarget(null)}
        onConfirm={() => {
          if (terminateTarget) {
            void sessions.terminate(terminateTarget).then(() => sessions.refresh())
          }
        }}
      />
    </div>
  )
}
