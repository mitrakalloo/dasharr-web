import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { EmptyState } from '@/components/ui/EmptyState'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { DEMO_QUEUE, type DemoQueueItem } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

const filters = ['all', 'downloading', 'paused', 'queued'] as const

export function QueuePage() {
  const navigate = useNavigate()
  const { isDemo, hydrated } = useConfiguredStack()
  const live = useDownloadQueue(!isDemo)
  const [filter, setFilter] = useState<(typeof filters)[number]>('all')
  const [selected, setSelected] = useState<DemoQueueItem | null>(null)

  const source = isDemo ? DEMO_QUEUE : live.items
  const canShowQueue = isDemo || live.hasSources

  const items = useMemo(() => {
    if (filter === 'all') return source
    return source.filter((item) => item.status === filter)
  }, [filter, source])

  function openItem(item: DemoQueueItem) {
    if (item.titleId) {
      navigate(titlePath(item.titleId))
      return
    }
    setSelected(item)
  }

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {isDemo
            ? `SABnzbd + qBittorrent · ${DEMO_QUEUE.length} jobs · demo`
            : live.status === 'loading'
              ? 'Loading downloads…'
              : live.status === 'error'
                ? live.error
                : `${source.length} job${source.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {!canShowQueue ? (
        <EmptyState
          title="No download clients"
          description="Add SABnzbd, qBittorrent, Sonarr, or Radarr in Settings."
        />
      ) : (
        <>
          <LayoutGroup id="queue-filters">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {filters.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    'relative min-h-[var(--tap)] shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium capitalize transition active:scale-95',
                    filter === value
                      ? 'border-transparent text-black'
                      : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  {filter === value ? (
                    <motion.span
                      layoutId="queue-filter-pill"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={spring}
                    />
                  ) : null}
                  <span className="relative z-10">{value}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>

          {!isDemo && live.status === 'error' ? (
            <EmptyState title="Couldn’t load queue" description={live.error} />
          ) : (
            <div className="space-y-3 pb-2">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <QueueItemCard
                    item={item}
                    onOpen={() => openItem(item)}
                    onPause={() => void live.pauseOrResume(item, item.status === 'paused')}
                  />
                </motion.div>
              ))}
              {items.length === 0 ? (
                <EmptyState
                  title="Queue is empty"
                  description={isDemo ? 'No jobs match this filter.' : 'Nothing downloading right now.'}
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

      <QueueItemSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
