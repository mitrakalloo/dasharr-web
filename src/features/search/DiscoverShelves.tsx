import { EmptyState } from '@/components/ui/EmptyState'
import { DiscoverShelfRow } from '@/features/search/DiscoverShelfRow'
import type { DiscoverCard, DiscoverShelf } from '@/lib/services/seerr.discover'

interface DiscoverShelvesProps {
  shelves: DiscoverShelf[]
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string
  onSelect: (item: DiscoverCard) => void
}

export function DiscoverShelves({ shelves, status, error, onSelect }: DiscoverShelvesProps) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, row) => (
          <div key={row} className="space-y-2.5">
            <div className="skeleton h-4 w-32 rounded-md" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, col) => (
                <div
                  key={col}
                  className="skeleton aspect-[2/3] w-[124px] shrink-0 rounded-[var(--radius-xl)] sm:w-[140px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return <EmptyState title="Discover unavailable" description={error ?? 'Try again later.'} />
  }

  if (shelves.length === 0) {
    return (
      <EmptyState
        title="No discover shelves"
        description="Seerr returned no trending or popular titles."
      />
    )
  }

  return (
    <div className="space-y-6">
      {shelves.map((shelf) => (
        <DiscoverShelfRow
          key={shelf.id}
          title={shelf.title}
          items={shelf.items}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
