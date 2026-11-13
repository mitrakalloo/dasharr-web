import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { EmptyState } from '@/components/ui/EmptyState'
import { SeerrRequestCard } from '@/features/seerr/SeerrRequestCard'
import { SeerrRequestSheet } from '@/features/seerr/SeerrRequestSheet'
import { DEMO_SEERR_REQUESTS, type DemoSeerrRequest } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

const filters = ['pending', 'approved', 'declined', 'all'] as const

export function SeerrRequestsPage() {
  const navigate = useNavigate()
  const { isDemo, has, hydrated } = useConfiguredStack()
  const live = useSeerrRequests(!isDemo && has('seerr'))
  const [filter, setFilter] = useState<(typeof filters)[number]>('pending')
  const [selected, setSelected] = useState<DemoSeerrRequest | null>(null)

  const source = isDemo
    ? DEMO_SEERR_REQUESTS
    : live.status === 'success'
      ? live.data
      : []

  const pendingCount = source.filter((item) => item.status === 'pending').length

  const items = useMemo(() => {
    if (filter === 'all') return source
    return source.filter((item) => item.status === filter)
  }, [filter, source])

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  if (!isDemo && !has('seerr')) {
    return (
      <div className="space-y-4 px-4 pt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Seerr</h1>
        <EmptyState
          title="Seerr not configured"
          description="Add a Seerr service in Settings to manage media requests."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seerr</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Media requests · {pendingCount} pending
          {isDemo ? ' · demo' : ''}
        </p>
      </div>

      <LayoutGroup id="seerr-filters">
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
                  layoutId="seerr-filter-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={spring}
                />
              ) : null}
              <span className="relative z-10">{value}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      {!isDemo && live.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading requests…</p>
      ) : null}

      {!isDemo && live.status === 'error' ? (
        <EmptyState title="Couldn’t load requests" description={live.error} />
      ) : null}

      <div className="space-y-3 pb-2">
        {items.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <SeerrRequestCard request={request} onOpen={() => setSelected(request)} />
          </motion.div>
        ))}
        {items.length === 0 && live.status !== 'loading' ? (
          <EmptyState
            title={`No ${filter} requests`}
            description="Requests from your Seerr users will appear here."
          />
        ) : null}
      </div>

      <SeerrRequestSheet
        request={selected}
        onClose={() => setSelected(null)}
        onOpenTitle={(titleId) => navigate(titlePath(titleId))}
        onApprove={isDemo ? undefined : live.approve}
        onDecline={isDemo ? undefined : live.decline}
      />
    </div>
  )
}
