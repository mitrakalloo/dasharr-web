import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronRight,
  LayoutGrid,
  Library,
  List,
  Plus,
  Search,
} from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Select } from '@/components/ui/Select'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useLibraryBrowse } from '@/hooks/useLibraryBrowse'
import { formatBytes } from '@/lib/format'
import { serviceAccent } from '@/lib/serviceColors'

type SortKey = 'title' | 'added' | 'size' | 'year' | 'rating'
type StatusFilter = 'all' | 'monitored' | 'missing'
type ViewMode = 'grid' | 'list'

export function LibraryPage() {
  const navigate = useNavigate()
  const { isDemo, hydrated } = useConfiguredStack()
  const library = useLibraryBrowse(!isDemo)
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const serviceFilter = params.get('service') ?? 'all'
  const sortParam = params.get('sort')
  const sort: SortKey =
    sortParam === 'added' ||
    sortParam === 'size' ||
    sortParam === 'year' ||
    sortParam === 'rating'
      ? sortParam
      : 'title'
  const statusParam = params.get('status')
  const statusFilter: StatusFilter =
    statusParam === 'monitored' || statusParam === 'missing' ? statusParam : 'all'
  const view: ViewMode = params.get('view') === 'list' ? 'list' : 'grid'

  function updateParam(key: string, value: string, defaultValue = '') {
    const next = new URLSearchParams(params)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  function resetFilters() {
    setParams(new URLSearchParams(), { replace: true })
  }

  const serviceOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of library.items) {
      counts.set(item.service, (counts.get(item.service) ?? 0) + 1)
    }
    const entries = Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b))
    return [
      { value: 'all', label: 'All', count: library.items.length },
      ...entries.map(([service, count]) => ({
        value: service,
        label: service.charAt(0).toUpperCase() + service.slice(1),
        count,
      })),
    ]
  }, [library.items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = library.items.filter((item) => {
      if (serviceFilter !== 'all' && item.service !== serviceFilter) return false
      if (statusFilter === 'monitored' && !item.monitored) return false
      if (statusFilter === 'missing' && (item.hasFile || !item.monitored)) return false
      if (q && !item.title.toLowerCase().includes(q)) return false
      return true
    })

    return list.slice().sort((a, b) => {
      if (sort === 'size') return b.sizeOnDisk - a.sizeOnDisk || a.title.localeCompare(b.title)
      if (sort === 'year') return (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title)
      if (sort === 'rating')
        return (b.rating ?? 0) - (a.rating ?? 0) || a.title.localeCompare(b.title)
      if (sort === 'added') {
        const aTime = a.added ? Date.parse(a.added) : 0
        const bTime = b.added ? Date.parse(b.added) : 0
        return bTime - aTime || a.title.localeCompare(b.title)
      }
      return a.title.localeCompare(b.title)
    })
  }, [library.items, query, serviceFilter, statusFilter, sort])

  const hasActiveFilters =
    Boolean(query) || serviceFilter !== 'all' || statusFilter !== 'all' || sort !== 'title'

  if (!hydrated) {
    return <PageSkeleton variant="grid" />
  }

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        eyebrow="Collection"
        title="Library"
        description={
          library.status === 'success'
            ? `${filtered.length} of ${library.items.length} titles across your *arr stack`
            : 'Browse titles already in Sonarr, Radarr, and Lidarr'
        }
        actions={
          <div className="flex items-center gap-2">
            <SegmentedControl
              ariaLabel="Library view mode"
              size="sm"
              value={view}
              onChange={(next) => updateParam('view', next, 'grid')}
              options={[
                { value: 'grid', label: 'Grid', icon: <LayoutGrid className="size-3.5" aria-hidden /> },
                { value: 'list', label: 'List', icon: <List className="size-3.5" aria-hidden /> },
              ]}
            />
            <Link to="/search">
              <Button size="sm" variant="soft">
                <Plus className="size-4" />
                Add title
              </Button>
            </Link>
          </div>
        }
      />

      {!isDemo && library.hasSources ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12">
            <Input
              leadingIcon={<Search className="size-4" />}
              value={query}
              onChange={(event) => updateParam('q', event.target.value)}
              onClear={() => updateParam('q', '')}
              placeholder="Filter library by title…"
              aria-label="Filter library"
              wrapperClassName="md:col-span-6"
            />
            <Select
              aria-label="Sort library"
              value={sort}
              onChange={(event) => updateParam('sort', event.target.value, 'title')}
              wrapperClassName="md:col-span-3"
              options={[
                { value: 'title', label: 'Sort: Title (A–Z)' },
                { value: 'added', label: 'Sort: Recently added' },
                { value: 'size', label: 'Sort: Largest on disk' },
                { value: 'year', label: 'Sort: Release year' },
                { value: 'rating', label: 'Sort: Highest rated' },
              ]}
            />
            <Select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => updateParam('status', event.target.value, 'all')}
              wrapperClassName="md:col-span-3"
              options={[
                { value: 'all', label: 'Status: All titles' },
                { value: 'monitored', label: 'Status: Monitored' },
                { value: 'missing', label: 'Status: Missing files' },
              ]}
            />
          </div>

          {serviceOptions.length > 2 ? (
            <SegmentedControl
              ariaLabel="Filter by service"
              variant="pills"
              value={serviceFilter}
              onChange={(next) => updateParam('service', next, 'all')}
              options={serviceOptions}
            />
          ) : null}
        </div>
      ) : null}

      {isDemo ? (
        <EmptyState
          icon={<Library className="size-5" aria-hidden="true" />}
          title="Demo mode"
          description="Connect Sonarr, Radarr, or Lidarr in Settings to browse your live media library."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      ) : !library.hasSources ? (
        <EmptyState
          icon={<Library className="size-5" aria-hidden="true" />}
          title="No library sources"
          description="Configure Sonarr, Radarr, or Lidarr in Settings to index your library."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      ) : library.status === 'loading' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="panel flex gap-3 rounded-[var(--radius-2xl)] p-3.5">
              <div className="skeleton h-[76px] w-[52px] shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2 py-1">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-36" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : library.status === 'error' ? (
        <EmptyState title="Couldn’t load library" description={library.error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching titles"
          description="Try clearing your search or adjusting filters."
          actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(titlePath(item.titleId))}
              className="group panel magnetic flex cursor-pointer items-center gap-3 rounded-[var(--radius-2xl)] p-3 text-left transition active:scale-[0.99]"
            >
              <PosterThumb
                src={item.poster}
                label={item.title}
                accent={serviceAccent(item.service)}
                className="h-[76px] w-[52px] rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                  {!item.monitored ? <Badge tone="neutral">Unmonitored</Badge> : null}
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-primary)]">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate tabular text-xs text-[var(--color-muted-foreground)]">
                  {item.year ? `${item.year} · ` : ''}
                  {item.sizeOnDisk > 0
                    ? formatBytes(item.sizeOnDisk)
                    : item.hasFile
                      ? 'On disk'
                      : 'Missing'}
                  {item.episodeCount
                    ? ` · ${item.episodeFileCount ?? 0}/${item.episodeCount}`
                    : ''}
                </p>
              </div>
              <ChevronRight
                className="size-4 shrink-0 text-[var(--color-muted-foreground)]/50 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(titlePath(item.titleId))}
              className="group flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--color-hover)] active:scale-[0.998]"
            >
              <PosterThumb
                src={item.poster}
                label={item.title}
                accent={serviceAccent(item.service)}
                className="h-11 w-8 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                  {item.title}
                </p>
                <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                  {item.subtitle}
                  {item.year ? ` · ${item.year}` : ''}
                  {item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ''}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                <Badge tone={item.hasFile ? 'success' : item.monitored ? 'warning' : 'neutral'}>
                  {item.episodeCount
                    ? `${item.episodeFileCount ?? 0}/${item.episodeCount} eps`
                    : item.hasFile
                      ? 'Downloaded'
                      : item.monitored
                        ? 'Missing'
                        : 'Unmonitored'}
                </Badge>
              </div>
              <span className="tabular w-20 shrink-0 text-right text-xs font-medium text-[var(--color-muted-foreground)]">
                {item.sizeOnDisk > 0 ? formatBytes(item.sizeOnDisk) : '—'}
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-[var(--color-muted-foreground)]/60 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
