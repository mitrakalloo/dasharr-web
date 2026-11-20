import { toast } from 'sonner'
import { Compass } from 'lucide-react'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
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
    return (
      <div>
        <SubpageHeader title="Discover" backTo="/search" />
        <PageSkeleton variant="grid" rows={6} />
      </div>
    )
  }

  if (isDemo || !has('seerr')) {
    return (
      <div>
        <SubpageHeader title="Discover" backTo="/search" />
        <div className="page-pad">
          <EmptyState
            icon={<Compass className="size-5" aria-hidden />}
            title="Seerr required"
            description="Add a Seerr service in Settings to browse trending and popular titles."
            actionLabel="Add service"
            actionTo="/settings?focus=services"
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <SubpageHeader
        title="Discover"
        subtitle="Browse popular, trending, and upcoming releases"
        backTo="/search"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Find', to: '/search' },
          { label: 'Discover' },
        ]}
      />
      <div className="page-pad space-y-5">
        <SegmentedControl
          ariaLabel="Discover category"
          value={browse.categoryId}
          onChange={browse.setCategoryId}
          size="sm"
          bleedMobile
          options={browse.categories.map((entry) => ({
            value: entry.id,
            label: entry.label,
          }))}
        />

        {browse.status === 'loading' ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[2/3] rounded-[var(--radius-xl)]" />
            ))}
          </div>
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
