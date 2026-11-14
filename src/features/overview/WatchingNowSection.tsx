import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { useTautulliSessions } from '@/hooks/useTautulliSessions'

interface WatchingNowSectionProps {
  enabled: boolean
}

export function WatchingNowSection({ enabled }: WatchingNowSectionProps) {
  const watching = useTautulliSessions(enabled)

  if (!enabled) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Watching now</h2>
        <Link to="/queue" className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]">
          Queue
        </Link>
      </div>
      {watching.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading streams…</p>
      ) : watching.items.length > 0 ? (
        <div className="space-y-3">
          {watching.items.slice(0, 3).map((item: DemoQueueItem) => (
            <QueueItemCard
              key={item.id}
              item={item}
              dense
              onOpen={() => undefined}
              onRemove={item.canRemove ? () => void watching.terminate(item) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="Nobody watching" description="No active Plex streams." />
      )}
    </section>
  )
}
