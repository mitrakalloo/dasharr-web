import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Radar, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Switch } from '@/components/ui/Switch'
import {
  getProwlarrIndexers,
  toggleProwlarrIndexer,
  type ProwlarrIndexer,
} from '@/lib/services/prowlarr'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

interface ProwlarrHubPanelProps {
  service: ServiceConfig
}

export function ProwlarrHubPanel({ service }: ProwlarrHubPanelProps) {
  const settings = useConfigStore((state) => state.settings)
  const [indexers, setIndexers] = useState<ProwlarrIndexer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProwlarrIndexers(settings, service)
      setIndexers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load indexers')
    } finally {
      setLoading(false)
    }
  }, [service, settings])

  useEffect(() => {
    void load()
  }, [load])

  async function onToggle(indexer: ProwlarrIndexer, next: boolean) {
    setBusyId(indexer.id)
    setIndexers((prev) =>
      prev.map((item) => (item.id === indexer.id ? { ...item, enable: next } : item)),
    )
    try {
      await toggleProwlarrIndexer(settings, service, indexer, next)
      toast.success(`${indexer.name} ${next ? 'enabled' : 'disabled'}`)
    } catch (err) {
      setIndexers((prev) =>
        prev.map((item) => (item.id === indexer.id ? { ...item, enable: !next } : item)),
      )
      toast.error(err instanceof Error ? err.message : 'Failed to update indexer')
    } finally {
      setBusyId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return indexers
      .filter((item) => !q || item.name.toLowerCase().includes(q) || item.protocol.toLowerCase().includes(q))
      .sort((a, b) => Number(b.enable) - Number(a.enable) || a.priority - b.priority)
  }, [indexers, query])

  const enabledCount = indexers.filter((i) => i.enable).length

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Indexers"
        description={`${enabledCount} of ${indexers.length} enabled`}
        count={filtered.length}
        trailing={
          <div className="flex items-center gap-2">
            <Link to="/indexers">
              <Button size="sm" variant="primary">
                <Radar className="size-3.5" aria-hidden />
                Search releases
              </Button>
            </Link>
            <Button size="sm" variant="secondary" loading={loading} onClick={() => void load()}>
              <RefreshCw className="size-3.5" aria-hidden />
            </Button>
          </div>
        }
      />

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter indexers…"
        leadingIcon={<Search className="size-4" aria-hidden />}
      />

      {error ? (
        <EmptyState
          compact
          title="Couldn’t load indexers"
          description={error}
          actionLabel="Retry"
          onAction={() => void load()}
        />
      ) : loading && indexers.length === 0 ? (
        <div className="space-y-2">
          <div className="skeleton h-14 rounded-[var(--radius-xl)]" />
          <div className="skeleton h-14 rounded-[var(--radius-xl)]" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState compact title="No indexers found" description="Try another search term." />
      ) : (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {filtered.map((indexer) => (
            <div
              key={indexer.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{indexer.name}</p>
                  <Badge tone="neutral" className="capitalize">
                    {indexer.protocol}
                  </Badge>
                  <span className="tabular text-[11px] text-[var(--color-muted-foreground)]">
                    Priority {indexer.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                  {indexer.supportsSearch ? 'Interactive search' : 'No search'} ·{' '}
                  {indexer.supportsRss ? 'RSS enabled' : 'No RSS'}
                </p>
              </div>
              <Switch
                checked={indexer.enable}
                disabled={busyId === indexer.id}
                ariaLabel={`Toggle ${indexer.name}`}
                onCheckedChange={(checked) => void onToggle(indexer, checked)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
