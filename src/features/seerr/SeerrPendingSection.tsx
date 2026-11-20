import { Inbox } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SeerrRequestCard } from '@/features/seerr/SeerrRequestCard'
import { DEMO_SEERR_REQUESTS, type DemoSeerrRequest } from '@/data/demoDashboard'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'

interface SeerrPendingSectionProps {
  demo?: boolean
  onOpen: (request: DemoSeerrRequest) => void
}

export function SeerrPendingSection({ demo = false, onOpen }: SeerrPendingSectionProps) {
  const live = useSeerrRequests(!demo)
  const pending = demo
    ? DEMO_SEERR_REQUESTS.filter((item) => item.status === 'pending').slice(0, 2)
    : live.status === 'success'
      ? live.data.filter((item) => item.status === 'pending').slice(0, 2)
      : []

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Seerr requests"
        count={pending.length > 0 ? pending.length : undefined}
        actionTo="/requests"
        actionLabel="Manage"
      />

      {!demo && live.status === 'loading' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="panel flex gap-3 rounded-[var(--radius-2xl)] p-3.5">
              <div className="skeleton h-[76px] w-[52px] shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2 py-1">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!demo && live.status === 'error' ? (
        <EmptyState compact title="Couldn’t load requests" description={live.error} />
      ) : null}

      {pending.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {pending.map((request) => (
            <SeerrRequestCard
              key={request.id}
              request={request}
              compact
              onOpen={() => onOpen(request)}
              onApprove={demo ? undefined : live.approve}
              onDecline={demo ? undefined : live.decline}
            />
          ))}
        </div>
      ) : live.status !== 'loading' && live.status !== 'error' ? (
        <EmptyState
          compact
          icon={<Inbox className="size-5" aria-hidden="true" />}
          title="No pending requests"
          description={demo ? 'Demo queue is clear.' : 'New Seerr requests will show up here.'}
        />
      ) : null}
    </section>
  )
}
