import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowDown, ChevronRight, Download } from 'lucide-react'

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
  const activeCount = items.filter((item) => item.status === 'downloading').length

  function openItem(item: DemoQueueItem) {
    if (item.titleId) {
      navigate(titlePath(item.titleId))
      return
    }
    setSelected(item)
  }

  return (
    <aside className="hidden h-full w-[var(--queue-rail)] shrink-0 flex-col border-l border-[var(--color-hairline)] bg-[var(--color-card)]/70 backdrop-blur-2xl xl:flex">
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                activeCount > 0
                  ? 'bg-[var(--color-success)] beacon-pulse'
                  : 'bg-[var(--color-muted-foreground)]/50'
              }`}
              aria-hidden
            />
            <h2 className="font-display text-sm font-semibold tracking-tight">Live queue</h2>
            {items.length > 0 ? (
              <span className="tabular rounded-full border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-muted-foreground)]">
                {items.length}
              </span>
            ) : null}
          </div>
          <p className="tabular mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
            <ArrowDown className="size-3 text-[var(--color-success)]" aria-hidden />
            <SpeedValue value={speed} />
          </p>
        </div>

        <Link
          to="/queue"
          className="group inline-flex min-h-9 items-center gap-0.5 rounded-[var(--radius-md)] px-2 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-muted)]"
        >
          <span>See all</span>
          <ChevronRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
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
          <EmptyState
            compact
            icon={<Download className="size-5" aria-hidden />}
            title="Queue is clear"
            description="Active transfers and Plex streams appear here."
          />
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
