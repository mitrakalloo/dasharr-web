import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, History, Search } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { Select } from '@/components/ui/Select'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadHistory } from '@/hooks/useDownloadHistory'
import { cn } from '@/lib/cn'
import { serviceAccent } from '@/lib/serviceColors'

export function HistoryPage() {
  const navigate = useNavigate()
  const { hydrated } = useConfiguredStack()
  const history = useDownloadHistory(true)
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const serviceFilter = params.get('service') ?? 'all'
  const eventFilter = params.get('event') ?? 'all'

  function updateParam(key: string, value: string, defaultValue = '') {
    const next = new URLSearchParams(params)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const eventTypes = useMemo(() => {
    const set = new Set(history.items.map((item) => item.eventType))
    return Array.from(set).sort()
  }, [history.items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return history.items.filter((item) => {
      if (serviceFilter !== 'all' && item.service !== serviceFilter) return false
      if (eventFilter !== 'all' && item.eventType !== eventFilter) return false
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.subtitle.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [history.items, serviceFilter, eventFilter, query])

  const hasFilters = Boolean(query) || serviceFilter !== 'all' || eventFilter !== 'all'

  if (!hydrated) {
    return <PageSkeleton variant="list" />
  }

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        eyebrow="Activity"
        title="History"
        description={
          history.status === 'success'
            ? `${filtered.length} of ${history.items.length} recent grabs, imports, and *arr events`
            : 'Recent grabs, imports, and *arr events'
        }
      />

      {history.hasSources ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Search"
            leadingIcon={<Search className="size-4" />}
            value={query}
            onChange={(event) => updateParam('q', event.target.value)}
            onClear={() => updateParam('q', '')}
            placeholder="Title or release…"
          />
          <Select
            label="Service"
            value={serviceFilter}
            options={[
              { value: 'all', label: 'All services' },
              { value: 'sonarr', label: 'Sonarr' },
              { value: 'radarr', label: 'Radarr' },
              { value: 'lidarr', label: 'Lidarr' },
            ]}
            onChange={(event) => updateParam('service', event.target.value, 'all')}
          />
          <Select
            label="Event"
            value={eventFilter}
            options={[
              { value: 'all', label: 'All events' },
              ...eventTypes.map((type) => ({ value: type, label: type })),
            ]}
            onChange={(event) => updateParam('event', event.target.value, 'all')}
          />
        </div>
      ) : null}

      {!history.hasSources ? (
        <EmptyState
          icon={<History className="size-5" aria-hidden="true" />}
          title="No *arr services"
          description="Configure Sonarr, Radarr, or Lidarr first to track download history."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      ) : history.status === 'loading' ? (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2 px-4 py-3.5">
              <div className="flex gap-2">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-20" />
              </div>
              <div className="skeleton h-4 w-64" />
              <div className="skeleton h-3 w-44" />
            </div>
          ))}
        </div>
      ) : history.status === 'error' ? (
        <EmptyState title="Couldn’t load history" description={history.error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<History className="size-5" aria-hidden="true" />}
          title="No matching history"
          description="Try clearing your search or filter selections."
          actionLabel={hasFilters ? 'Clear filters' : undefined}
          onAction={hasFilters ? () => setParams(new URLSearchParams(), { replace: true }) : undefined}
        />
      ) : (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!item.titleId}
              onClick={() => {
                if (item.titleId) navigate(titlePath(item.titleId))
              }}
              className={cn(
                'group flex w-full items-center gap-3 px-4 py-3.5 text-left transition',
                item.titleId
                  ? 'cursor-pointer hover:bg-[var(--color-hover)] active:scale-[0.995]'
                  : 'cursor-default',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                  <Badge>{item.eventType}</Badge>
                  <span className="ml-auto tabular text-[11px] text-[var(--color-muted-foreground)]">
                    {item.date}
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-primary)]">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
                  {item.subtitle}
                </p>
              </div>
              {item.titleId ? (
                <ChevronRight
                  className="size-4 shrink-0 text-[var(--color-muted-foreground)]/60 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
