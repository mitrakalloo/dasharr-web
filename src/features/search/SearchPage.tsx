import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { AddMediaSheet } from '@/features/search/AddMediaSheet'
import { SearchResultList } from '@/features/search/SearchResultList'
import { DEMO_SEARCH } from '@/data/demoDashboard'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useMediaSearch } from '@/hooks/useMediaSearch'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

const scopes = ['All', 'Series', 'Movies'] as const

export function SearchPage() {
  const { isDemo, has, hydrated } = useConfiguredStack()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<(typeof scopes)[number]>('All')
  const [sheetOpen, setSheetOpen] = useState(false)
  const live = useMediaSearch(!isDemo, query)

  const demoItems = DEMO_SEARCH.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.trim().toLowerCase())
    if (!matchesQuery) return false
    if (scope === 'All') return true
    if (scope === 'Series') return item.type === 'series'
    return item.type === 'movie'
  }).map((item) => ({
    id: item.id,
    titleId: item.titleId,
    title: item.title,
    year: item.year,
    type: item.type as 'series' | 'movie',
    rating: item.rating,
    poster: '',
    overview: '',
    source: 'library' as const,
    alreadyAdded: true,
  }))

  const liveItems = live.items.filter((item) => {
    if (scope === 'All') return true
    if (scope === 'Series') return item.type === 'series'
    return item.type === 'movie'
  })

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {isDemo
            ? 'Find titles · demo'
            : has('seerr')
              ? 'Seerr discover + library browse'
              : 'Library browse and *arr lookup'}
        </p>
      </div>

      {!isDemo && !live.canSearch ? (
        <EmptyState
          title="Nothing to search"
          description="Add Seerr, Sonarr, or Radarr in Settings."
        />
      ) : (
        <>
          <Input
            placeholder="Search library or discover…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <LayoutGroup id="search-scopes">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {scopes.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScope(value)}
                  className={cn(
                    'relative min-h-[var(--tap)] shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium transition active:scale-95',
                    scope === value
                      ? 'border-transparent text-black'
                      : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  {scope === value ? (
                    <motion.span
                      layoutId="search-scope-pill"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={spring}
                    />
                  ) : null}
                  <span className="relative z-10">{value}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>

          {!isDemo && live.status === 'loading' ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">Searching…</p>
          ) : null}

          {!isDemo && live.status === 'error' ? (
            <EmptyState title="Search failed" description={live.error} />
          ) : (
            <SearchResultList
              items={isDemo ? demoItems : liveItems}
              emptyTitle={query ? 'No matches' : 'Library is empty'}
              emptyDescription={
                query
                  ? 'Try another query.'
                  : 'Add titles via Seerr or *arr lookup.'
              }
              onAdd={isDemo ? undefined : (item) => void live.addItem(item)}
            />
          )}

          {has('seerr') && !isDemo ? (
            <Link
              to="/requests"
              className="inline-flex min-h-[var(--tap)] w-full items-center justify-center rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-accent)]"
            >
              Open Seerr requests
            </Link>
          ) : null}

          <Button className="w-full" onClick={() => setSheetOpen(true)}>
            Manual search & quality profile
          </Button>
        </>
      )}

      <AddMediaSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
