import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

import { EmptyState } from '@/components/ui/EmptyState'
import { OverviewQueueSection } from '@/features/overview/OverviewQueueSection'
import { ServiceStatusStrip } from '@/features/overview/ServiceStatusStrip'
import { StorageBandwidthCard } from '@/features/overview/StorageBandwidthCard'
import { UpcomingGroupedList } from '@/features/overview/UpcomingGroupedList'
import { useOverviewSections } from '@/features/overview/useOverviewSections'
import { WatchingNowSection } from '@/features/overview/WatchingNowSection'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { SeerrPendingSection } from '@/features/seerr/SeerrPendingSection'
import { SeerrRequestSheet } from '@/features/seerr/SeerrRequestSheet'
import type { DemoQueueItem, DemoSeerrRequest } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { useConfigStore } from '@/stores/configStore'

export function OverviewPage() {
  const navigate = useNavigate()
  const o = useOverviewSections()
  const seerr = useSeerrRequests(!o.isDemo && o.showSeerr)
  const [filter, setFilter] = useState<string | undefined>()
  const [selected, setSelected] = useState<DemoQueueItem | null>(null)
  const [seerrRequest, setSeerrRequest] = useState<DemoSeerrRequest | null>(null)

  function openItem(item: DemoQueueItem) {
    if (item.titleId) {
      navigate(titlePath(item.titleId))
      return
    }
    setSelected(item)
  }

  function handleServiceSelect(id: string) {
    const configured = useConfigStore.getState().services.find((s) => s.id === id)
    if (configured?.type === 'seerr' || id === 'seerr') {
      navigate('/requests')
      return
    }
    setFilter(id === filter ? undefined : id)
  }

  if (!o.hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <motion.div
      className="space-y-5 px-4 pt-4 lg:px-6 lg:pt-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <h1 className="font-display text-2xl font-extrabold tracking-tight lg:text-3xl">Home</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {o.isDemo
            ? 'Demo desk · add a service in Settings to go live'
            : 'Live companion for your configured services'}
        </p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <ServiceStatusStrip activeId={filter} onSelect={handleServiceSelect} />
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-2">
        {o.showStorage ? (
          <motion.div variants={staggerItem}>
            <StorageBandwidthCard />
          </motion.div>
        ) : null}
        {o.showSeerr ? (
          <motion.div variants={staggerItem}>
            <SeerrPendingSection demo={o.isDemo} onOpen={setSeerrRequest} />
          </motion.div>
        ) : null}
      </div>

      {o.showWatching ? (
        <motion.div variants={staggerItem}>
          <WatchingNowSection enabled={!o.isDemo && o.showWatching} />
        </motion.div>
      ) : null}

      {o.showQueue ? (
        <motion.div variants={staggerItem}>
          <OverviewQueueSection
            items={o.queuePreview}
            onOpen={openItem}
            onPause={(item) => void o.pauseOrResume(item, item.status === 'paused')}
            onRemove={(item) => void o.removeItem?.(item)}
            onRetry={(item) => void o.retryItem?.(item)}
          />
        </motion.div>
      ) : null}

      {o.showCalendar ? (
        <motion.section className="space-y-3 pb-2" variants={staggerItem}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Airing & releasing soon</h2>
            <Link
              to="/calendar"
              className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]"
            >
              Calendar
            </Link>
          </div>
          {o.calendarStatus === 'loading' ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">Loading calendar…</p>
          ) : o.calendarStatus === 'error' ? (
            <EmptyState title="Couldn’t load calendar" description={o.calendarError ?? ''} />
          ) : (
            <UpcomingGroupedList releases={o.upcoming} />
          )}
        </motion.section>
      ) : null}

      <QueueItemSheet
        item={selected}
        onClose={() => setSelected(null)}
        onPause={
          selected?.canPause
            ? () => void o.pauseOrResume(selected, selected.status === 'paused')
            : undefined
        }
        onRemove={selected?.canRemove ? () => void o.removeItem?.(selected) : undefined}
      />
      <SeerrRequestSheet
        request={seerrRequest}
        onClose={() => setSeerrRequest(null)}
        onOpenTitle={(titleId) => navigate(titlePath(titleId))}
        onApprove={o.isDemo ? undefined : seerr.approve}
        onDecline={o.isDemo ? undefined : seerr.decline}
      />
    </motion.div>
  )
}
