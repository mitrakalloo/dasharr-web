import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckSquare,
  ChevronRight,
  Clapperboard,
  Search,
  Square,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import {
  useWantedMissing,
  type WantedItem,
  type WantedMode,
} from '@/hooks/useWantedMissing'
import { serviceAccent } from '@/lib/serviceColors'
import { commandLidarrAlbumSearch } from '@/lib/services/lidarr.releases'
import { commandRadarrMoviesSearch } from '@/lib/services/radarr'
import { commandSonarrEpisodeSearch } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

export function WantedPage() {
  const navigate = useNavigate()
  const { isDemo, hydrated } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const [params, setParams] = useSearchParams()

  const mode: WantedMode = params.get('tab') === 'cutoff' ? 'cutoff' : 'missing'
  const query = params.get('q') ?? ''

  const wanted = useWantedMissing(!isDemo, mode)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [busyBulk, setBusyBulk] = useState(false)
  const [busyRowId, setBusyRowId] = useState<string | null>(null)

  function setMode(next: WantedMode) {
    setSelectedIds(new Set())
    const nextParams = new URLSearchParams(params)
    if (next === 'missing') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  function setQuery(next: string) {
    const nextParams = new URLSearchParams(params)
    if (next) nextParams.set('q', next)
    else nextParams.delete('q')
    setParams(nextParams, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return wanted.items
    return wanted.items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q),
    )
  }, [wanted.items, query])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    if (filtered.length === 0) return
    const allSelected = filtered.every((item) => selectedIds.has(item.id))
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((item) => item.id)))
    }
  }

  async function dispatchSearch(items: WantedItem[]) {
    const grouped = new Map<string, { service: WantedItem['service']; ids: number[] }>()
    for (const item of items) {
      const entry = grouped.get(item.serviceId) ?? { service: item.service, ids: [] }
      entry.ids.push(item.rawItemId)
      grouped.set(item.serviceId, entry)
    }

    const tasks = Array.from(grouped.entries()).map(async ([serviceId, group]) => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return
      if (group.service === 'sonarr') {
        await commandSonarrEpisodeSearch(settings, service, group.ids)
      } else if (group.service === 'radarr') {
        await commandRadarrMoviesSearch(settings, service, group.ids)
      } else if (group.service === 'lidarr') {
        await commandLidarrAlbumSearch(settings, service, group.ids)
      }
    })

    await Promise.all(tasks)
  }

  async function handleSearchSelected() {
    const targets = wanted.items.filter((item) => selectedIds.has(item.id))
    if (targets.length === 0) return
    setBusyBulk(true)
    try {
      await dispatchSearch(targets)
      toast.success(`Queued search for ${targets.length} item${targets.length === 1 ? '' : 's'}`)
      setSelectedIds(new Set())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk search failed')
    } finally {
      setBusyBulk(false)
    }
  }

  async function handleSearchOne(item: WantedItem) {
    setBusyRowId(item.id)
    try {
      await dispatchSearch([item])
      toast.success(`Searching for ${item.title}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setBusyRowId(null)
    }
  }

  if (!hydrated) {
    return <PageSkeleton variant="list" />
  }

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((item) => selectedIds.has(item.id))

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        eyebrow="Monitoring"
        title="Wanted"
        description={
          wanted.status === 'success'
            ? `${wanted.items.length} ${mode === 'cutoff' ? 'cutoff unmet' : 'missing'} monitored item${wanted.items.length === 1 ? '' : 's'}`
            : 'Missing and cutoff-unmet monitored episodes, movies, and albums'
        }
        actions={
          selectedIds.size > 0 ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear ({selectedIds.size})
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={busyBulk}
                onClick={() => void handleSearchSelected()}
              >
                <Search className="size-3.5" aria-hidden />
                Search selected
              </Button>
            </div>
          ) : undefined
        }
      />

      {!isDemo && wanted.hasSources ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SegmentedControl
            ariaLabel="Wanted category"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'missing', label: 'Missing' },
              { value: 'cutoff', label: 'Cutoff unmet' },
            ]}
          />
          <Input
            leadingIcon={<Search className="size-4" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
            placeholder={
              mode === 'cutoff' ? 'Filter cutoff-unmet upgrades…' : 'Filter missing items…'
            }
            aria-label="Filter wanted items"
            wrapperClassName="flex-1"
          />
          {filtered.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={toggleAllVisible}>
              {allVisibleSelected ? (
                <CheckSquare className="size-3.5" aria-hidden />
              ) : (
                <Square className="size-3.5" aria-hidden />
              )}
              {allVisibleSelected ? 'Deselect all' : 'Select all'}
            </Button>
          ) : null}
        </div>
      ) : null}

      {isDemo ? (
        <EmptyState
          icon={<Clapperboard className="size-5" aria-hidden="true" />}
          title="Demo mode"
          description="Connect Sonarr, Radarr, or Lidarr in Settings to inspect missing and cutoff-unmet media."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      ) : !wanted.hasSources ? (
        <EmptyState
          icon={<Clapperboard className="size-5" aria-hidden="true" />}
          title="No *arr services"
          description="Configure Sonarr, Radarr, or Lidarr to monitor missing episodes and movies."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      ) : wanted.status === 'loading' ? (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2 px-4 py-3.5">
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-56" />
              <div className="skeleton h-3 w-40" />
            </div>
          ))}
        </div>
      ) : wanted.status === 'error' ? (
        <EmptyState title="Couldn’t load wanted" description={wanted.error} />
      ) : wanted.items.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="size-5" aria-hidden="true" />}
          title={mode === 'cutoff' ? 'All quality targets met' : 'Nothing missing'}
          description={
            mode === 'cutoff'
              ? 'No monitored movies or episodes are waiting for a quality upgrade.'
              : 'Your monitored library looks completely up to date.'
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try clearing the filter." />
      ) : (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {filtered.map((item) => {
            const checked = selectedIds.has(item.id)
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 px-3 py-3 transition hover:bg-[var(--color-hover)] sm:px-4"
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={`Select ${item.title}`}
                  onClick={() => toggleSelect(item.id)}
                  className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
                >
                  {checked ? (
                    <CheckSquare className="size-4.5 text-[var(--color-primary)]" aria-hidden />
                  ) : (
                    <Square className="size-4.5" aria-hidden />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(titlePath(item.titleId))}
                  className="group min-w-0 flex-1 cursor-pointer text-left"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                    {mode === 'cutoff' ? <Badge tone="warning">Upgrade</Badge> : null}
                  </div>
                  <p className="truncate text-sm font-medium text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-primary)]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
                    {item.subtitle}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={`Search ${item.title}`}
                    size="sm"
                    disabled={busyRowId === item.id}
                    onClick={() => void handleSearchOne(item)}
                  >
                    <Search className="size-4" />
                  </IconButton>
                  <button
                    type="button"
                    aria-label={`Open ${item.title}`}
                    onClick={() => navigate(titlePath(item.titleId))}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
