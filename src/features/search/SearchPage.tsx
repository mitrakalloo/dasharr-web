import { Link } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { AddMediaSheet } from '@/features/search/AddMediaSheet'
import { DiscoverShelves } from '@/features/search/DiscoverShelves'
import { SearchResultList } from '@/features/search/SearchResultList'
import { SEARCH_SCOPES, useSearchPage } from '@/features/search/useSearchPage'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

export function SearchPage() {
  const s = useSearchPage()

  if (!s.hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Find</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {s.isDemo
            ? 'Find titles · demo'
            : s.has('seerr')
              ? 'Discover shelves + library search'
              : 'Library browse and *arr lookup'}
        </p>
      </div>

      {!s.isDemo && !s.live.canSearch && !s.has('seerr') ? (
        <EmptyState
          title="Nothing to search"
          description="Add Seerr, Sonarr, or Radarr in Settings."
        />
      ) : (
        <>
          <Input
            placeholder="Search library or discover…"
            value={s.query}
            onChange={(event) => s.setQuery(event.target.value)}
          />

          <LayoutGroup id="search-scopes">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {SEARCH_SCOPES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => s.setScope(value)}
                  className={cn(
                    'relative min-h-[var(--tap)] shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium transition active:scale-95',
                    s.scope === value
                      ? 'border-transparent text-[var(--color-on-primary-container)]'
                      : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  {s.scope === value ? (
                    <motion.span
                      layoutId="search-scope-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-primary-container)]"
                      transition={spring}
                    />
                  ) : null}
                  <span className="relative z-10">{value}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>

          {s.showDiscover ? (
            <DiscoverShelves
              shelves={s.discover.shelves}
              status={s.discover.status === 'idle' ? 'loading' : s.discover.status}
              error={s.discover.status === 'error' ? s.discover.error : undefined}
              onSelect={s.handleDiscoverSelect}
            />
          ) : null}

          {s.query.trim() ? (
            <>
              {!s.isDemo && s.live.status === 'loading' ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">Searching…</p>
              ) : null}
              {!s.isDemo && s.live.status === 'error' ? (
                <EmptyState title="Search failed" description={s.live.error} />
              ) : (
                <SearchResultList
                  items={s.isDemo ? s.demoItems : s.liveItems}
                  emptyTitle="No matches"
                  emptyDescription="Try another query."
                  onAdd={s.isDemo ? undefined : (item) => void s.live.addItem(item)}
                />
              )}
            </>
          ) : null}

          {s.has('seerr') && !s.isDemo ? (
            <Link
              to="/requests"
              className="inline-flex min-h-[var(--tap)] w-full items-center justify-center rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-accent)]"
            >
              Open Seerr requests
            </Link>
          ) : null}

          {s.has('prowlarr') && !s.isDemo ? (
            <Link
              to="/indexers"
              className="inline-flex min-h-[var(--tap)] w-full items-center justify-center rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-accent)]"
            >
              Browse Prowlarr releases
            </Link>
          ) : null}

          <Button className="w-full" onClick={() => s.setSheetOpen(true)}>
            Manual search & quality profile
          </Button>
        </>
      )}

      <AddMediaSheet open={s.sheetOpen} onClose={() => s.setSheetOpen(false)} />
    </div>
  )
}
