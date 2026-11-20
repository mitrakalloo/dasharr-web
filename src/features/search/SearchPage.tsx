import { Link } from 'react-router-dom'
import { Compass, Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { AddMediaSheet } from '@/features/search/AddMediaSheet'
import { AddOptionsSheet } from '@/features/search/AddOptionsSheet'
import { DiscoverShelves } from '@/features/search/DiscoverShelves'
import { SearchResultList } from '@/features/search/SearchResultList'
import { SEARCH_SCOPES, useSearchPage } from '@/features/search/useSearchPage'
import { cn } from '@/lib/cn'

export function SearchPage() {
  const s = useSearchPage()

  if (!s.hydrated) return <PageSkeleton variant="grid" rows={4} />

  if (s.needsSetup) {
    return (
      <div className="page-pad space-y-5">
        <PageHeader title="Find" description="Search your library and request new titles" />
        <EmptyState
          icon={<Search className="size-5" aria-hidden />}
          title="Connect a search source"
          description="Add Seerr, Sonarr, Radarr, or Lidarr in Settings to search and request media."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      </div>
    )
  }

  const canSearch = s.isDemo || s.live.canSearch || s.has('seerr')
  const itemsToShow = s.isDemo ? s.demoItems : s.liveItems

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        title="Find"
        description={
          s.isDemo
            ? 'Search demo catalog or connect services in Settings'
            : s.has('seerr')
              ? 'Discover shelves + multi-service search'
              : 'Library browse and *arr lookup'
        }
        actions={
          <div className="flex items-center gap-2">
            {s.has('seerr') && !s.isDemo ? (
              <Link to="/discover">
                <Button variant="secondary" size="sm">
                  <Compass className="size-3.5" aria-hidden />
                  Discover
                </Button>
              </Link>
            ) : null}
            {!s.isDemo && s.live.canSearch ? (
              <Button variant="soft" size="sm" onClick={() => s.setSheetOpen(true)}>
                <SlidersHorizontal className="size-3.5" aria-hidden />
                Quick add
              </Button>
            ) : null}
          </div>
        }
      />

      {!canSearch ? (
        <EmptyState
          icon={<Search className="size-5" aria-hidden />}
          title="Nothing to search"
          description="Add Seerr, Sonarr, Radarr, or Lidarr in Settings."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      ) : (
        <>
          <div className="space-y-3">
            <Input
              leadingIcon={<Search className="size-4" />}
              placeholder="Search movies, series, music, or discover…"
              value={s.query}
              onChange={(event) => s.setQuery(event.target.value)}
              onClear={() => s.setQuery('')}
            />

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <SegmentedControl
                ariaLabel="Media type scope"
                value={s.scope}
                onChange={s.setScope}
                size="sm"
                bleedMobile
                options={SEARCH_SCOPES.map((value) => ({ value, label: value }))}
              />

              {s.serviceChips.length > 1 ? (
                <div className="no-scrollbar -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  {s.serviceChips.map((chip) => {
                    const active = s.serviceFilter === chip.id
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => s.setServiceFilter(chip.id)}
                        className={cn(
                          'min-h-8 shrink-0 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors active:scale-95',
                          active
                            ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                            : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
                        )}
                      >
                        {chip.label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {s.showDiscover ? (
            <DiscoverShelves
              shelves={s.discover.shelves}
              status={s.discover.status === 'idle' ? 'loading' : s.discover.status}
              error={s.discover.status === 'error' ? s.discover.error : undefined}
              onSelect={s.handleDiscoverSelect}
            />
          ) : null}

          {s.isDemo || s.query.trim() ? (
            <>
              {!s.isDemo && s.live.status === 'loading' ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-[var(--radius-2xl)]" />
                  ))}
                </div>
              ) : !s.isDemo && s.live.status === 'error' ? (
                <EmptyState title="Search failed" description={s.live.error} />
              ) : (
                <SearchResultList
                  items={itemsToShow}
                  emptyTitle="No matches"
                  emptyDescription="Try another title, keyword, or media scope."
                  onAdd={s.isDemo ? undefined : (item) => void s.live.beginAdd(item)}
                />
              )}
            </>
          ) : !s.showDiscover ? (
            <EmptyState
              icon={<Search className="size-5" aria-hidden />}
              title="Start typing to search"
              description="Search across your configured *arr apps and Seerr."
            />
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
