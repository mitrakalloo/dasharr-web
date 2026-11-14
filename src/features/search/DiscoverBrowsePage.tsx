import { toast } from 'sonner'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { AddOptionsSheet } from '@/features/search/AddOptionsSheet'
import { DiscoverBrowseGrid } from '@/features/search/DiscoverBrowseGrid'
import { useDiscoverBrowse } from '@/features/search/useDiscoverBrowse'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useMediaSearch } from '@/hooks/useMediaSearch'
import { useConfigStore } from '@/stores/configStore'

export function DiscoverBrowsePage() {
  const { isDemo, has, hydrated } = useConfiguredStack()
  const seerr = useConfigStore((state) =>
    state.services.find((service) => service.type === 'seerr' && service.enabled),
  )
  const search = useMediaSearch(!isDemo && has('seerr'), '')
  const browse = useDiscoverBrowse(!isDemo && Boolean(seerr), seerr)

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  if (isDemo || !has('seerr')) {
    return (
      <div>
        <SubpageHeader title="Discover" backTo="/search" />
        <div className="px-4 pt-4">
          <EmptyState title="Seerr required" description="Add Seerr to browse Discover." />
        </div>
      </div>
    )
  }

  return (
    <div>
      <SubpageHeader
        title="Discover"
        subtitle="Browse popular and upcoming titles"
        backTo="/search"
      />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {browse.categories.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => browse.setCategoryId(entry.id)}
              className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium ${
                browse.categoryId === entry.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-secondary)]'
                  : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
        {browse.status === 'loading' ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {browse.status === 'error' ? (
          <EmptyState title="Browse failed" description={browse.error} />
        ) : null}
        <DiscoverBrowseGrid
          items={browse.items}
          onSelect={(item) =>
            void search
              .beginAdd({
                id: item.id,
                title: item.title,
                year: item.year ?? 0,
                type: item.type === 'tv' ? 'series' : 'movie',
                rating: item.rating ?? 0,
                poster: item.poster,
                overview: '',
                source: 'seerr',
                tmdbId: item.tmdbId,
              })
              .catch((err: unknown) =>
                toast.error(err instanceof Error ? err.message : 'Add failed'),
              )
          }
        />
      </div>
      <AddOptionsSheet
        open={Boolean(search.pendingItem)}
        title={search.pendingItem ? `Add · ${search.pendingItem.title}` : 'Add'}
        bundle={search.addBundle}
        defaults={search.defaultAdd}
        onClose={search.cancelAdd}
        onConfirm={(options) => void search.confirmAdd(options)}
      />
    </div>
  )
}
