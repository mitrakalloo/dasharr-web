import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

import { HomeDashboardSwitcher } from '@/features/home/HomeDashboardSwitcher'
import { HomeWidgetRenderer } from '@/features/home/HomeWidgetRenderer'
import { useHomePage } from '@/features/home/useHomePage'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { SeerrRequestSheet } from '@/features/seerr/SeerrRequestSheet'
import { titlePath } from '@/data/demoTitles'
import { staggerContainer, staggerItem } from '@/lib/motion'

export function OverviewPage() {
  const navigate = useNavigate()
  const home = useHomePage()
  const o = home.overview

  if (!home.ready || !home.active) {
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
        <HomeDashboardSwitcher
          dashboards={home.dashboards}
          activeId={home.active.id}
          onSelect={home.setActiveDashboard}
        />
      </motion.div>

      {home.enabledWidgets.map((widget) => (
        <motion.div key={`${home.active!.id}-${widget.id}`} variants={staggerItem}>
          <HomeWidgetRenderer
            widgetId={widget.id}
            dashboard={home.active!}
            overview={o}
            ribbon={home.ribbon}
            serviceFilter={home.serviceFilter}
            onServiceSelect={home.handleServiceSelect}
            onOpenQueueItem={home.openItem}
            onOpenSeerr={home.setSeerrRequest}
          />
        </motion.div>
      ))}

      <QueueItemSheet
        item={home.selected}
        onClose={() => home.setSelected(null)}
        onPause={
          home.selected?.canPause
            ? () => void o.pauseOrResume(home.selected!, home.selected!.status === 'paused')
            : undefined
        }
        onRemove={
          home.selected?.canRemove ? () => void o.removeItem?.(home.selected!) : undefined
        }
      />
      <SeerrRequestSheet
        request={home.seerrRequest}
        onClose={() => home.setSeerrRequest(null)}
        onOpenTitle={(titleId) => navigate(titlePath(titleId))}
        onApprove={o.isDemo ? undefined : home.seerr.approve}
        onDecline={o.isDemo ? undefined : home.seerr.decline}
      />
    </motion.div>
  )
}
