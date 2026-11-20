import { useNavigate } from 'react-router-dom'
import { Tv } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { useTautulliSessions } from '@/hooks/useTautulliSessions'

interface WatchingNowSectionProps {
  enabled: boolean
}

export function WatchingNowSection({ enabled }: WatchingNowSectionProps) {
  const navigate = useNavigate()
  const watching = useTautulliSessions(enabled)

  if (!enabled) return null

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Watching now"
        count={watching.items.length}
        actionLabel="Queue"
        actionTo="/queue?filter=watching"
      />
      {watching.status === 'loading' ? (
        <div className="skeleton h-24 rounded-[var(--radius-2xl)]" />
      ) : watching.items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {watching.items.slice(0, 4).map((item: DemoQueueItem) => (
            <QueueItemCard
              key={item.id}
              item={item}
              dense
              onOpen={
                item.titleId ? () => navigate(titlePath(item.titleId!)) : undefined
              }
              onRemove={item.canRemove ? () => void watching.terminate(item) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          compact
          icon={<Tv className="size-5" aria-hidden />}
          title="Nobody watching"
          description="Active Plex streams from Tautulli appear here."
        />
      )}
    </section>
  )
}
