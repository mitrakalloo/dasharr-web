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
    return <p className="text-sm text-[var(--color-muted-foreground)]">Loading discover…</p>
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
    <div className="space-y-5">
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
