import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { Badge } from '@/components/ui/Badge'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useLibraryBrowse } from '@/hooks/useLibraryBrowse'
import { serviceAccent } from '@/lib/serviceColors'

export function LibraryPage() {
  const navigate = useNavigate()
  const { isDemo, hydrated } = useConfiguredStack()
  const library = useLibraryBrowse(!isDemo)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return library.items
    return library.items.filter((item) => item.title.toLowerCase().includes(q))
  }, [library.items, query])

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div className="space-y-4 px-4 pt-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Browse titles already in Sonarr, Radarr, and Lidarr
        </p>
      </div>

      <Input
        label="Filter"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter library…"
      />

      {isDemo ? (
        <EmptyState
          title="Demo mode"
          description="Add *arr services in Settings to browse your library."
        />
      ) : !library.hasSources ? (
        <EmptyState title="No library sources" description="Configure Sonarr, Radarr, or Lidarr." />
      ) : library.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading library…</p>
      ) : library.status === 'error' ? (
        <EmptyState title="Couldn’t load library" description={library.error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No titles" description="Nothing matched this filter." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(titlePath(item.titleId))}
              className="panel flex cursor-pointer gap-3 rounded-2xl p-3 text-left transition hover:bg-[var(--color-card-elevated)] active:scale-[0.99]"
            >
              <PosterThumb
                src={item.poster}
                label={item.title}
                accent={serviceAccent(item.service)}
                className="h-[72px] w-12 rounded-lg"
              />
              <div className="min-w-0">
                <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                <p className="mt-1.5 truncate text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {item.subtitle}
                  {item.year ? ` · ${item.year}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="pb-2 text-center text-xs text-[var(--color-muted-foreground)]">
        <Link to="/search" className="text-[var(--color-accent)]">
          Search & add
        </Link>
      </p>
    </div>
  )
}
