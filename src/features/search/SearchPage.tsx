import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { AddMediaSheet } from '@/features/search/AddMediaSheet'
import { AddOptionsSheet } from '@/features/search/AddOptionsSheet'
import { DiscoverShelves } from '@/features/search/DiscoverShelves'
import { SearchResultList } from '@/features/search/SearchResultList'
import { SEARCH_SCOPES, useSearchPage } from '@/features/search/useSearchPage'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

export function SearchPage() {
  const s = useSearchPage()
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!s.hydrated) return <PageSkeleton rows={3} />

  if (s.needsSetup) {
    return (
      <div className="page-pad space-y-4">
        <PageHeader title="Find" description="Search your library and request new titles" />
        <EmptyState
          title="Connect a search source"
          description="Add Seerr, Sonarr, Radarr, or Lidarr to search."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      </div>
    )
  }

  return (
    <div className="page-pad space-y-4">
      <PageHeader
        title="Find"
        description={
          s.has('seerr')
            ? 'Discover shelves + multi-service search'
            : 'Library browse and *arr lookup'
        }
      />

      {!s.live.canSearch && !s.has('seerr') ? (
        <EmptyState
          title="Nothing to search"
          description="Add Seerr, Sonarr, Radarr, or Lidarr in Settings."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      ) : (
        <>
          <Input
            placeholder="Search library or discover…"
            value={s.query}
            onChange={(event) => s.setQuery(event.target.value)}
          />

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
              {s.live.status === 'loading' ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">Searching…</p>
              ) : null}
              {s.live.status === 'error' ? (
                <EmptyState title="Search failed" description={s.live.error} />
              ) : (
                <SearchResultList
                  items={s.liveItems}
                  emptyTitle="No matches"
                  emptyDescription="Try another query."
                  onAdd={(item) => void s.live.beginAdd(item)}
                />
              )}
            </>
          ) : null}

          <button
            type="button"
            className="text-sm text-[var(--color-secondary)]"
            onClick={() => setShowAdvanced((value) => !value)}
          >
            {showAdvanced ? 'Hide advanced' : 'Advanced filters'}
          </button>

          {showAdvanced ? (
            <>
              {s.serviceChips.length > 1 ? (
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
                  {s.serviceChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => s.setServiceFilter(chip.id)}
                      className={cn(
                        'min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium transition active:scale-95',
                        s.serviceFilter === chip.id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-secondary)]'
                          : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]',
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              ) : null}

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

              {s.has('seerr') ? (
                <Link
                  to="/discover"
                  className="inline-flex min-h-[var(--tap)] w-full items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-muted)]"
                >
                  Browse Discover
                </Link>
              ) : null}

              <Button className="w-full" onClick={() => s.setSheetOpen(true)}>
                Manual search & quality profile
              </Button>
            </>
          ) : null}
        </>
      )}

      <AddMediaSheet open={s.sheetOpen} onClose={() => s.setSheetOpen(false)} />
      <AddOptionsSheet
        open={Boolean(s.live.pendingItem)}
        title={s.live.pendingItem ? `Add · ${s.live.pendingItem.title}` : 'Add options'}
        bundle={s.live.addBundle}
        defaults={s.live.defaultAdd}
        onClose={s.live.cancelAdd}
        onConfirm={(options) => void s.live.confirmAdd(options)}
      />
    </div>
  )
}
