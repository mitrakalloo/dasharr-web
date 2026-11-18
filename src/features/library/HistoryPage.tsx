import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadHistory } from '@/hooks/useDownloadHistory'
import { serviceAccent } from '@/lib/serviceColors'

export function HistoryPage() {
  const navigate = useNavigate()
  const { hydrated } = useConfiguredStack()
  const history = useDownloadHistory(true)
  const [serviceFilter, setServiceFilter] = useState('all')
  const [eventFilter, setEventFilter] = useState('all')

  const eventTypes = useMemo(() => {
    const set = new Set(history.items.map((item) => item.eventType))
    return Array.from(set).sort()
  }, [history.items])

  const filtered = useMemo(
    () =>
      history.items.filter((item) => {
        if (serviceFilter !== 'all' && item.service !== serviceFilter) return false
        if (eventFilter !== 'all' && item.eventType !== eventFilter) return false
        return true
      }),
    [history.items, serviceFilter, eventFilter],
  )

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div className="page-pad space-y-4">
      <PageHeader title="History" description="Recent grabs, imports, and *arr events" />

      {history.hasSources ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Service"
            value={serviceFilter}
            options={[
              { value: 'all', label: 'All services' },
              { value: 'sonarr', label: 'Sonarr' },
              { value: 'radarr', label: 'Radarr' },
            ]}
            onChange={(event) => setServiceFilter(event.target.value)}
          />
          <Select
            label="Event"
            value={eventFilter}
            options={[
              { value: 'all', label: 'All events' },
              ...eventTypes.map((type) => ({ value: type, label: type })),
            ]}
            onChange={(event) => setEventFilter(event.target.value)}
          />
        </div>
      ) : null}

      {!history.hasSources ? (
        <EmptyState
          title="No *arr services"
          description="Configure Sonarr or Radarr first."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      ) : history.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading history…</p>
      ) : history.status === 'error' ? (
        <EmptyState title="Couldn’t load history" description={history.error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching history" description="Try clearing filters." />
      ) : (
        <div className="panel divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!item.titleId}
              onClick={() => {
                if (item.titleId) navigate(titlePath(item.titleId))
              }}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                item.titleId
                  ? 'cursor-pointer hover:bg-white/5 active:scale-[0.99]'
                  : 'cursor-default'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                  <Badge>{item.eventType}</Badge>
                </div>
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                  {item.subtitle}
                </p>
                <p className="mt-1 tabular text-[11px] text-[var(--color-muted-foreground)]">
                  {item.date}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="pb-2 text-center text-xs text-[var(--color-muted-foreground)]">
        <Link to="/settings" className="text-[var(--color-accent)]">
          Settings
        </Link>
      </p>
    </div>
  )
}
