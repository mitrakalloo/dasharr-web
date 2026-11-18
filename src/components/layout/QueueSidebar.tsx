import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { SpeedValue } from '@/components/ui/SpeedValue'
import { DEMO_QUEUE, type DemoQueueItem } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { useAggregateDownloadSpeed } from '@/hooks/useAggregateDownloadSpeed'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'

export function QueueSidebar() {
  const navigate = useNavigate()
  const { isDemo } = useConfiguredStack()
  const queue = useDownloadQueue(!isDemo)
  const speed = useAggregateDownloadSpeed()
  const [selected, setSelected] = useState<DemoQueueItem | null>(null)

  const items = isDemo ? DEMO_QUEUE : queue.items
  const preview = items.slice(0, 8)

  function openItem(item: DemoQueueItem) {
    if (item.titleId) {
      navigate(titlePath(item.titleId))
      return
    }
    setSelected(item)
  }

  return (
    <aside className="hidden h-full w-[var(--queue-rail)] shrink-0 flex-col border-l border-[var(--color-hairline)] bg-[var(--color-card)]/55 backdrop-blur-xl xl:flex">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-4 py-3.5">
        <div>
          <h2 className="font-display text-sm font-semibold tracking-tight">Live queue</h2>
          <p className="tabular text-xs text-[var(--color-muted-foreground)]">
            ↓ <SpeedValue value={speed} />
          </p>
        </div>
        <Link
          to="/queue"
          className="min-h-[var(--tap)] content-center text-sm font-medium text-[var(--color-primary)] transition hover:text-[var(--color-secondary)]"
        >
          See all
        </Link>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {preview.length > 0 ? (
          preview.map((item) => (
            <QueueItemCard
              key={item.id}
              item={item}
              onOpen={() => openItem(item)}
              onPause={
                item.canPause
                  ? () => void queue.pauseOrResume(item, item.status === 'paused')
                  : undefined
              }
              onRemove={item.canRemove ? () => void queue.removeItem(item) : undefined}
              onRetry={item.canRetry ? () => void queue.retryItem(item) : undefined}
              dense
            />
          ))
        ) : (
          <EmptyState title="Queue is empty" description="Nothing downloading right now." />
        )}
      </div>

      <QueueItemSheet
        item={selected}
        onClose={() => setSelected(null)}
        onPause={
          selected?.canPause
            ? () => void queue.pauseOrResume(selected, selected.status === 'paused')
            : undefined
        }
        onRemove={
          selected?.canRemove ? () => void queue.removeItem(selected) : undefined
        }
      />
    </aside>
  )
}
