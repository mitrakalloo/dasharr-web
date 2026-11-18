import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { QueueFilterBar } from '@/features/queue/QueueFilterBar'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { useQueuePage } from '@/features/queue/useQueuePage'

export function QueuePage() {
  const q = useQueuePage()

  if (!q.hydrated) return <PageSkeleton rows={4} />

  return (
    <div className="space-y-4 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {`${q.source.length} item${q.source.length === 1 ? '' : 's'}${
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
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      ) : (
        <>
          <QueueFilterBar
            filters={q.visibleFilters}
            value={q.filter}
            onChange={q.setFilter}
          />

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
                    onRemove={
                      item.canRemove
                        ? () => {
                            const canBlock =
                              item.service === 'sonarr' ||
                              item.service === 'radarr' ||
                              item.service === 'lidarr'
                            q.handleRemove(
                              item,
                              canBlock ? window.confirm('Also add to blocklist?') : false,
                            )
                          }
                        : undefined
                    }
                    onRetry={
                      item.status === 'request'
                        ? undefined
                        : item.canRetry
                          ? () => void q.live.retryItem(item)
                          : undefined
                    }
                    onApprove={
                      item.status === 'request' && item.canRetry
                        ? () => q.approveRequest(item)
                        : undefined
                    }
                    onDecline={
                      item.status === 'request' && item.canRetry
                        ? () => q.declineRequest(item)
                        : undefined
                    }
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
