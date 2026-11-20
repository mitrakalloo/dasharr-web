import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
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
      <SectionHeader
        title="Live queue"
        count={items.length}
        actionLabel="See all"
        actionTo="/queue"
      />
      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
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
        <EmptyState compact title="Queue is clear" description="Nothing downloading right now." />
      )}
    </section>
  )
}
