import { Link } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { EmptyState } from '@/components/ui/EmptyState'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { useQueuePage } from '@/features/queue/useQueuePage'
import { DEMO_QUEUE } from '@/data/demoDashboard'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

export function QueuePage() {
  const q = useQueuePage()

  if (!q.hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {q.isDemo
            ? `Downloads · ${DEMO_QUEUE.length} jobs · demo`
            : `${q.source.length} item${q.source.length === 1 ? '' : 's'}${
                q.live.updatedAt
                  ? ` · updated ${new Date(q.live.updatedAt).toLocaleTimeString()}`
                  : ''
              }`}
        </p>
      </div>

      {!q.canShowQueue ? (
        <EmptyState
          title="Nothing in the queue"
          description="Add a download client, Seerr, or Tautulli in Settings."
        />
      ) : (
        <>
          <LayoutGroup id="queue-filters">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {q.visibleFilters.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => q.setFilter(value)}
                  className={cn(
                    'relative min-h-[var(--tap)] shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium capitalize transition active:scale-95',
                    q.filter === value
                      ? 'border-transparent text-[var(--color-on-primary-container)]'
                      : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  {q.filter === value ? (
                    <motion.span
                      layoutId="queue-filter-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-primary-container)]"
                      transition={spring}
                    />
                  ) : null}
                  <span className="relative z-10">{value}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>

          {!q.isDemo &&
          q.live.status === 'error' &&
          q.filter !== 'requests' &&
          q.filter !== 'watching' ? (
            <EmptyState title="Couldn’t load downloads" description={q.live.error} />
          ) : (
            <div className="grid grid-cols-1 gap-3 pb-2 lg:grid-cols-2 xl:grid-cols-3">
              {q.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <QueueItemCard
                    item={item}
                    dense
                    onOpen={() => q.openItem(item)}
                    onPause={
                      item.canPause
                        ? () => void q.live.pauseOrResume(item, item.status === 'paused')
                        : undefined
                    }
                    onRemove={item.canRemove ? () => q.handleRemove(item) : undefined}
                    onRetry={item.canRetry ? () => void q.live.retryItem(item) : undefined}
                  />
                </motion.div>
              ))}
              {q.items.length === 0 ? (
                <EmptyState
                  title="Queue is empty"
                  description={
                    q.isDemo ? 'No jobs match this filter.' : 'Nothing in this lane right now.'
                  }
                />
              ) : null}
            </div>
          )}
        </>
      )}

      <p className="pb-2 text-center text-xs text-[var(--color-muted-foreground)]">
        Need a client?{' '}
        <Link to="/settings" className="text-[var(--color-accent)]">
          Settings
        </Link>
      </p>

      <QueueItemSheet
        item={q.selected}
        onClose={() => q.setSelected(null)}
        onPause={
          q.selected?.canPause
            ? () => void q.live.pauseOrResume(q.selected!, q.selected!.status === 'paused')
            : undefined
        }
        onRemove={q.selected?.canRemove ? () => q.handleRemove(q.selected!) : undefined}
      />
    </div>
  )
}
