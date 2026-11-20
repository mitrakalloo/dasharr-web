import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Inbox } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { DEMO_SEERR_REQUESTS, type DemoSeerrRequest } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { SeerrIssuesSection } from '@/features/seerr/SeerrIssuesSection'
import { SeerrRequestCard } from '@/features/seerr/SeerrRequestCard'
import { SeerrRequestSheet } from '@/features/seerr/SeerrRequestSheet'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'

type SeerrFilter = 'pending' | 'approved' | 'declined' | 'all'

export function SeerrRequestsPage() {
  const navigate = useNavigate()
  const { isDemo, has, hydrated } = useConfiguredStack()
  const live = useSeerrRequests(!isDemo && has('seerr'))
  const [params, setParams] = useSearchParams()
  const statusParam = params.get('status')
  const filter: SeerrFilter =
    statusParam === 'approved' || statusParam === 'declined' || statusParam === 'all'
      ? statusParam
      : 'pending'
  const [selected, setSelected] = useState<DemoSeerrRequest | null>(null)

  function setFilter(next: SeerrFilter) {
    const nextParams = new URLSearchParams(params)
    if (next === 'pending') nextParams.delete('status')
    else nextParams.set('status', next)
    setParams(nextParams, { replace: true })
  }

  const source = useMemo(
    () =>
      isDemo
        ? DEMO_SEERR_REQUESTS
        : live.status === 'success'
          ? live.data
          : [],
    [isDemo, live],
  )

  const counts = useMemo(() => {
    let pending = 0
    let approved = 0
    let declined = 0
    for (const item of source) {
      if (item.status === 'pending') pending++
      else if (item.status === 'approved') approved++
      else if (item.status === 'declined') declined++
    }
    return { pending, approved, declined, all: source.length }
  }, [source])

  const items = useMemo(() => {
    if (filter === 'all') return source
    return source.filter((item) => item.status === filter)
  }, [filter, source])

  const filterOptions = useMemo(
    () => [
      { value: 'pending' as const, label: 'Pending', count: counts.pending },
      { value: 'approved' as const, label: 'Approved', count: counts.approved },
      { value: 'declined' as const, label: 'Declined', count: counts.declined },
      { value: 'all' as const, label: 'All', count: counts.all },
    ],
    [counts],
  )

  if (!hydrated) {
    return <PageSkeleton variant="grid" />
  }

  if (!isDemo && !has('seerr')) {
    return (
      <div className="page-pad space-y-5">
        <PageHeader eyebrow="Moderation" title="Requests" />
        <EmptyState
          icon={<Inbox className="size-5" aria-hidden="true" />}
          title="Seerr not configured"
          description="Connect Seerr, Overseerr, or Jellyseerr in Settings to review and moderate household requests."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      </div>
    )
  }

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        eyebrow={isDemo ? 'Demo workspace' : 'Seerr'}
        title="Requests"
        description={`${counts.pending} pending · ${counts.all} total`}
      />

      <SegmentedControl
        ariaLabel="Filter requests"
        variant="pills"
        value={filter}
        onChange={setFilter}
        options={filterOptions}
      />

      {!isDemo && live.status === 'loading' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="panel flex gap-3 rounded-[var(--radius-2xl)] p-3.5">
              <div className="skeleton h-[76px] w-[52px] shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2 py-1">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-44" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isDemo && live.status === 'error' ? (
        <EmptyState title="Couldn’t load requests" description={live.error} />
      ) : null}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 pb-2 md:grid-cols-2">
          {items.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(index, 8) * 0.03,
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SeerrRequestCard
                request={request}
                onOpen={() => setSelected(request)}
                onApprove={isDemo ? undefined : live.approve}
                onDecline={isDemo ? undefined : live.decline}
              />
            </motion.div>
          ))}
        </div>
      ) : !(!isDemo && live.status === 'loading') && !(!isDemo && live.status === 'error') ? (
        <EmptyState
          icon={<Inbox className="size-5" aria-hidden="true" />}
          title={`No ${filter === 'all' ? '' : `${filter} `}requests`}
          description="Requests from your Seerr users will appear here."
        />
      ) : null}

      <SeerrIssuesSection enabled={!isDemo && has('seerr')} />

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
