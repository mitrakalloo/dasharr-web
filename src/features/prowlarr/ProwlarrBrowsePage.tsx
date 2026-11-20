import { useMemo, useState } from 'react'
import { Download, Radio, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { formatBytes } from '@/lib/format'
import {
  grabProwlarrRelease,
  searchProwlarrReleases,
  type ProwlarrRelease,
} from '@/lib/services/prowlarr'
import { useConfigStore } from '@/stores/configStore'

type ProtocolFilter = 'all' | 'torrent' | 'usenet'

export function ProwlarrBrowsePage() {
  const { isDemo, has, hydrated } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const prowlarr = useConfigStore((state) =>
    state.services.find((service) => service.type === 'prowlarr' && service.enabled),
  )
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProwlarrRelease[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [protocol, setProtocol] = useState<ProtocolFilter>('all')
  const [grabbingKey, setGrabbingKey] = useState<string | null>(null)

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    if (!prowlarr || !query.trim()) return
    setStatus('loading')
    try {
      const data = await searchProwlarrReleases(settings, prowlarr, query.trim())
      setResults(data)
      setProtocol('all')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setStatus('error')
    }
  }

  async function handleGrab(release: ProwlarrRelease) {
    if (!prowlarr || grabbingKey) return
    const key = `${release.indexerId}-${release.guid}`
    setGrabbingKey(key)
    try {
      await grabProwlarrRelease(settings, prowlarr, release)
      toast.success('Release sent to download client')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Grab failed')
    } finally {
      setGrabbingKey(null)
    }
  }

  const filtered = useMemo(() => {
    if (protocol === 'all') return results
    return results.filter((item) => item.protocol.toLowerCase() === protocol)
  }, [protocol, results])

  const protocolOptions = useMemo(() => {
    const torrentCount = results.filter((r) => r.protocol.toLowerCase() === 'torrent').length
    const usenetCount = results.filter((r) => r.protocol.toLowerCase() === 'usenet').length
    return [
      { value: 'all' as const, label: 'All', count: results.length },
      { value: 'torrent' as const, label: 'Torrent', count: torrentCount },
      { value: 'usenet' as const, label: 'Usenet', count: usenetCount },
    ]
  }, [results])

  if (!hydrated) {
    return <PageSkeleton variant="list" />
  }

  if (isDemo || !has('prowlarr')) {
    return (
      <div className="page-pad space-y-5">
        <PageHeader eyebrow="Indexers" title="Prowlarr" />
        <EmptyState
          icon={<Radio className="size-5" aria-hidden="true" />}
          title="Prowlarr required"
          description="Connect an enabled Prowlarr service in Settings to search across your indexers and grab releases directly."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      </div>
    )
  }

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        eyebrow="Indexers"
        title="Prowlarr"
        description="Search across configured indexers and grab releases directly"
      />

      <form onSubmit={(event) => void handleSearch(event)} className="flex flex-wrap gap-2 sm:flex-nowrap">
        <Input
          wrapperClassName="min-w-0 flex-1"
          leadingIcon={<Search className="size-4" />}
          placeholder="Search movies, episodes, packs, or releases…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
        />
        <Button
          type="submit"
          loading={status === 'loading'}
          disabled={!query.trim()}
          className="shrink-0"
        >
          Search
        </Button>
      </form>

      {status === 'success' && results.length > 0 ? (
        <SegmentedControl
          ariaLabel="Filter by protocol"
          variant="pills"
          value={protocol}
          onChange={setProtocol}
          options={protocolOptions}
        />
      ) : null}

      {status === 'idle' ? (
        <EmptyState
          icon={<Search className="size-5" aria-hidden="true" />}
          title="Search your indexers"
          description="Enter a title, season pack, or release tag to query Prowlarr across all active indexers."
        />
      ) : null}

      {status === 'loading' ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="panel flex items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-3.5">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-48" />
              </div>
              <div className="skeleton h-9 w-20 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      ) : null}

      {status === 'error' ? <EmptyState title="Search failed" description={error} /> : null}

      {status === 'success' && filtered.length === 0 ? (
        <EmptyState
          title="No matching releases"
          description="Try broadening your query or switching the protocol filter."
        />
      ) : null}

      {status === 'success' && filtered.length > 0 ? (
        <div className="space-y-2.5 pb-4">
          {filtered.map((release) => {
            const key = `${release.indexerId}-${release.guid}`
            const isTorrent = release.protocol.toLowerCase() === 'torrent'
            return (
              <article
                key={key}
                className="panel flex flex-col gap-3 rounded-[var(--radius-2xl)] p-3.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words text-sm font-medium leading-snug text-[var(--color-foreground)]">
                    {release.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                    <Badge tone={isTorrent ? 'info' : 'primary'}>{release.protocol}</Badge>
                    <Badge>{release.indexer ?? `Indexer ${release.indexerId}`}</Badge>
                    <span className="tabular font-medium text-[var(--color-foreground)]">
                      {formatBytes(release.size)}
                    </span>
                    {release.seeders != null ? (
                      <Badge
                        tone={release.seeders > 0 ? 'success' : 'warning'}
                        className="tabular"
                      >
                        {release.seeders} seeders
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="soft"
                  loading={grabbingKey === key}
                  disabled={grabbingKey !== null}
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => void handleGrab(release)}
                >
                  <Download className="size-3.5" />
                  Grab
                </Button>
              </article>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
