import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { formatBytes } from '@/lib/format'
import {
  grabProwlarrRelease,
  searchProwlarrReleases,
  type ProwlarrRelease,
} from '@/lib/services/prowlarr'
import { useConfigStore } from '@/stores/configStore'

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

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    if (!prowlarr || !query.trim()) return
    setStatus('loading')
    try {
      const data = await searchProwlarrReleases(settings, prowlarr, query.trim())
      setResults(data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setStatus('error')
    }
  }

  async function handleGrab(release: ProwlarrRelease) {
    if (!prowlarr) return
    try {
      await grabProwlarrRelease(settings, prowlarr, release)
      toast.success('Release grabbed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Grab failed')
    }
  }

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  if (isDemo || !has('prowlarr')) {
    return (
      <div className="px-4 pt-4">
        <EmptyState
          title="Prowlarr required"
          description="Add an enabled Prowlarr service in Settings to browse releases."
        />
      </div>
    )
  }

  return (
    <div className="page-pad space-y-4">
      <PageHeader title="Prowlarr" description="Search indexers and grab releases" />

      <form onSubmit={(event) => void handleSearch(event)} className="flex gap-2">
        <Input
          className="flex-1"
          placeholder="Search releases…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button type="submit" disabled={status === 'loading' || !query.trim()}>
          {status === 'loading' ? '…' : 'Search'}
        </Button>
      </form>

      {status === 'error' ? <EmptyState title="Search failed" description={error} /> : null}

      {status === 'success' && results.length === 0 ? (
        <EmptyState title="No releases" description="Try a different query." />
      ) : null}

      <div className="space-y-2 pb-4">
        {results.map((release) => (
          <div
            key={`${release.indexerId}-${release.guid}`}
            className="flex items-center gap-3 panel rounded-[var(--radius-2xl)] px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">{release.title}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                {release.indexer ?? `Indexer ${release.indexerId}`} · {release.protocol} ·{' '}
                {formatBytes(release.size)}
                {release.seeders != null ? ` · ${release.seeders} seeders` : ''}
              </p>
            </div>
            <Button
              variant="soft"
              className="min-h-10 shrink-0 px-3 text-xs"
              onClick={() => void handleGrab(release)}
            >
              Grab
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
