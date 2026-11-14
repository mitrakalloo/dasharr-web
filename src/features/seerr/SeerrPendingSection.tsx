import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
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
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Seerr requests</h2>
        <Link
          to="/requests"
          className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]"
        >
          Manage
        </Link>
      </div>

      {!demo && live.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading requests…</p>
      ) : null}

      {!demo && live.status === 'error' ? (
        <EmptyState title="Couldn’t load requests" description={live.error} />
      ) : null}

      {pending.length > 0 ? (
        <div className="space-y-3">
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
          title="No pending requests"
          description={demo ? 'Demo queue is clear.' : 'New Seerr requests will show up here.'}
        />
      ) : null}
    </section>
  )
}
