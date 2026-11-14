import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import type { DemoQueueItem } from '@/data/demoDashboard'

interface OverviewQueueSectionProps {
  items: DemoQueueItem[]
  onOpen: (item: DemoQueueItem) => void
  onPause?: (item: DemoQueueItem) => void
  onRemove?: (item: DemoQueueItem) => void
  onRetry?: (item: DemoQueueItem) => void
}

export function OverviewQueueSection({
  items,
  onOpen,
  onPause,
  onRemove,
  onRetry,
}: OverviewQueueSectionProps) {
  return (
    <section className="space-y-3 xl:hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Live queue</h2>
        <Link to="/queue" className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]">
          See all
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <QueueItemCard
              key={item.id}
              item={item}
              onOpen={() => onOpen(item)}
              onPause={item.canPause && onPause ? () => onPause(item) : undefined}
              onRemove={item.canRemove && onRemove ? () => onRemove(item) : undefined}
              onRetry={item.canRetry && onRetry ? () => onRetry(item) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="Queue is empty" description="Nothing downloading right now." />
      )}
    </section>
  )
}
