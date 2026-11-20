import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, HardDrive, Search } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDiskSpace } from '@/hooks/useDiskSpace'
import { useLibraryBrowse } from '@/hooks/useLibraryBrowse'
import { formatBytes } from '@/lib/format'
import { serviceAccent } from '@/lib/serviceColors'
import { getUnraidSnapshot, type UnraidSnapshot } from '@/lib/services/unraid'
import { titlePath } from '@/data/demoTitles'
import { useConfigStore } from '@/stores/configStore'

function volumeTone(pct: number): string {
  if (pct > 85) return 'var(--color-destructive)'
  if (pct > 70) return 'var(--color-warning)'
  return 'var(--color-success)'
}

export function StoragePage() {
  const { hydrated, isDemo, has } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const unraid = useConfigStore((state) =>
    state.services.find((s) => s.enabled && s.type === 'unraid'),
  )
  const disks = useDiskSpace(!isDemo)
  const library = useLibraryBrowse(!isDemo)

  const [unraidSnapshot, setUnraidSnapshot] = useState<UnraidSnapshot | null>(null)
  const [query, setQuery] = useState('')
  const [mediaFilter, setMediaFilter] = useState<'all' | 'radarr' | 'sonarr'>('all')

  useEffect(() => {
    if (!unraid || isDemo) return
    let cancelled = false
    getUnraidSnapshot(settings, unraid)
      .then((snap) => {
        if (!cancelled) setUnraidSnapshot(snap)
      })
      .catch(() => {
        if (!cancelled) setUnraidSnapshot(null)
      })
    return () => {
      cancelled = true
    }
  }, [isDemo, settings, unraid])

  const volumes = useMemo(() => (disks.status === 'success' ? disks.data : []), [disks])

  const summary = useMemo(() => {
    const totalTb = volumes.reduce((sum, v) => sum + v.totalTb, 0)
    const usedTb = volumes.reduce((sum, v) => sum + v.usedTb, 0)
    const freeTb = Math.max(0, totalTb - usedTb)
    const pct = totalTb > 0 ? Math.round((usedTb / totalTb) * 100) : 0
    return { totalTb, usedTb, freeTb, pct }
  }, [volumes])

  const largestMedia = useMemo(() => {
    const q = query.trim().toLowerCase()
    return library.items
      .filter((item) => item.sizeOnDisk > 0)
      .filter((item) => mediaFilter === 'all' || item.service === mediaFilter)
      .filter((item) => !q || item.title.toLowerCase().includes(q))
      .sort((a, b) => b.sizeOnDisk - a.sizeOnDisk)
      .slice(0, 60)
  }, [library.items, mediaFilter, query])

  if (!hydrated) return <PageSkeleton variant="grid" />

  return (
    <div className="page-pad space-y-6">
      <PageHeader
        eyebrow="Capacity & Cleanup"
        title="Storage"
        description={
          volumes.length > 0
            ? `${summary.freeTb.toFixed(2)} TB free across ${volumes.length} volume${volumes.length === 1 ? '' : 's'}`
            : 'Mounted disk capacity and largest media in your library'
        }
      />

      {volumes.length === 0 && !unraid && !library.hasSources ? (
        <EmptyState
          icon={<HardDrive className="size-5" aria-hidden />}
          title="No storage sources"
          description="Connect Sonarr, Radarr, Lidarr, or Unraid in Settings to monitor volumes and media footprint."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      ) : (
        <>
          {volumes.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              <div className="panel rounded-[var(--radius-xl)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  Total capacity
                </p>
                <p className="tabular mt-1 text-lg font-semibold">{summary.totalTb.toFixed(1)} TB</p>
              </div>
              <div className="panel rounded-[var(--radius-xl)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  Used
                </p>
                <p className="tabular mt-1 text-lg font-semibold">{summary.usedTb.toFixed(1)} TB</p>
              </div>
              <div className="panel rounded-[var(--radius-xl)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  Free space
                </p>
                <p className="tabular mt-1 text-lg font-semibold text-[var(--color-success)]">
                  {summary.freeTb.toFixed(2)} TB
                </p>
              </div>
              <div className="panel rounded-[var(--radius-xl)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  Utilization
                </p>
                <p
                  className="tabular mt-1 text-lg font-semibold"
                  style={{ color: volumeTone(summary.pct) }}
                >
                  {summary.pct}%
                </p>
              </div>
            </div>
          ) : null}

          <section className="space-y-3">
            <SectionHeader
              title="Mounted volumes"
              count={volumes.length}
              actionLabel={unraid ? 'Unraid array' : undefined}
              actionTo={unraid ? `/service/${unraid.id}` : undefined}
            />
            {disks.status === 'loading' ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="skeleton h-24 rounded-[var(--radius-2xl)]" />
                <div className="skeleton h-24 rounded-[var(--radius-2xl)]" />
              </div>
            ) : volumes.length === 0 ? (
              <EmptyState
                compact
                title="No *arr disk volumes reported"
                description={
                  has('unraid')
                    ? 'Open your Unraid hub to inspect array drives.'
                    : 'Configured *arr root folders will appear here.'
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {volumes.map((volume) => {
                  const pct = volume.totalTb > 0 ? (volume.usedTb / volume.totalTb) * 100 : 0
                  const free = Math.max(0, volume.totalTb - volume.usedTb).toFixed(2)
                  return (
                    <div
                      key={volume.id}
                      className="panel space-y-2.5 rounded-[var(--radius-2xl)] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold">
                            {volume.label}
                          </p>
                          <p className="truncate font-mono text-[11px] text-[var(--color-muted-foreground)]">
                            {volume.path}
                          </p>
                        </div>
                        <Badge
                          tone={pct > 85 ? 'danger' : pct > 70 ? 'warning' : 'success'}
                          className="tabular"
                        >
                          {Math.round(pct)}%
                        </Badge>
                      </div>
                      <ProgressBar value={pct} animated color={volumeTone(pct)} />
                      <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)] tabular">
                        <span>{volume.usedTb.toFixed(2)} TB used</span>
                        <span>
                          {free} TB free of {volume.totalTb} TB
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {unraid && unraidSnapshot ? (
              <Link
                to={`/service/${unraid.id}`}
                className="magnetic panel group flex items-center justify-between gap-3 rounded-[var(--radius-2xl)] px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-warning-muted)] text-[var(--color-warning)]">
                    <HardDrive className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      Unraid array ({unraidSnapshot.state})
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {unraidSnapshot.disks.length} disks · {unraidSnapshot.containers.length}{' '}
                      containers — inspect temperatures & manage Docker
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" />
              </Link>
            ) : null}
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Largest media in library"
              description="Click any title to inspect files, change quality profile, or remove"
              count={largestMedia.length}
            />

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter media by title…"
                leadingIcon={<Search className="size-4" aria-hidden />}
                wrapperClassName="flex-1"
              />
              <SegmentedControl
                ariaLabel="Filter largest media"
                value={mediaFilter}
                onChange={setMediaFilter}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'radarr', label: 'Movies' },
                  { value: 'sonarr', label: 'Series' },
                ]}
              />
            </div>

            {library.status === 'loading' ? (
              <div className="space-y-2">
                <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
                <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
              </div>
            ) : largestMedia.length === 0 ? (
              <EmptyState
                compact
                title="No sized media items"
                description="Movies and series with files on disk will be ranked here by size."
              />
            ) : (
              <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
                {largestMedia.map((item) => (
                  <Link
                    key={item.id}
                    to={titlePath(item.titleId)}
                    className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--color-hover)]"
                  >
                    <PosterThumb
                      src={item.poster}
                      label={item.title}
                      accent={serviceAccent(item.service)}
                      className="h-12 w-9 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                        {item.year ? `${item.year} · ` : ''}
                        {item.subtitle}
                        {item.episodeFileCount !== undefined && item.episodeCount
                          ? ` · ${item.episodeFileCount}/${item.episodeCount} eps`
                          : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <Badge color={serviceAccent(item.service)} className="hidden sm:inline-flex">
                        {item.service}
                      </Badge>
                      <span className="tabular text-sm font-semibold text-[var(--color-foreground)]">
                        {formatBytes(item.sizeOnDisk)}
                      </span>
                      <ChevronRight className="size-4 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
