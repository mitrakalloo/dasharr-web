import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceStatusStrip } from '@/features/overview/ServiceStatusStrip'
import { StorageBandwidthCard } from '@/features/overview/StorageBandwidthCard'
import { useOverviewSections } from '@/features/overview/useOverviewSections'
import { SeerrPendingSection } from '@/features/seerr/SeerrPendingSection'
import { SeerrRequestSheet } from '@/features/seerr/SeerrRequestSheet'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { UpcomingReleaseRow } from '@/features/calendar/UpcomingReleaseRow'
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
      className="space-y-5 px-4 pt-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {o.isDemo
            ? 'Demo mode · add a service in Settings to go live'
            : 'Live companion for your configured services'}
        </p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <ServiceStatusStrip activeId={filter} onSelect={handleServiceSelect} />
      </motion.div>

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

      {o.showQueue ? (
        <motion.section className="space-y-3" variants={staggerItem}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live queue</h2>
            <Link to="/queue" className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]">
              See all
            </Link>
          </div>
          {o.queuePreview.length > 0 ? (
            <div className="space-y-3">
              {o.queuePreview.map((item) => (
                <QueueItemCard
                  key={item.id}
                  item={item}
                  onOpen={() => openItem(item)}
                  onPause={() => void o.pauseOrResume(item, item.status === 'paused')}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Queue is empty" description="Nothing downloading right now." />
          )}
        </motion.section>
      ) : null}

      {o.showCalendar ? (
        <motion.section className="space-y-3 pb-2" variants={staggerItem}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Airing soon</h2>
            <Link to="/calendar" className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]">
              Calendar
            </Link>
          </div>
          {o.calendarStatus === 'loading' ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">Loading calendar…</p>
          ) : o.calendarStatus === 'error' ? (
            <EmptyState title="Couldn’t load calendar" description={o.calendarError ?? ''} />
          ) : o.upcoming.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
              {o.upcoming.map((release, index, list) => (
                <UpcomingReleaseRow
                  key={release.id}
                  release={release}
                  bordered={index < list.length - 1}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming releases" description="Nothing monitored is airing soon." />
          )}
        </motion.section>
      ) : null}

      <QueueItemSheet item={selected} onClose={() => setSelected(null)} />
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
