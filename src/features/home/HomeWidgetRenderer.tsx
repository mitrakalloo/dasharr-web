import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { HomeChecklist } from '@/features/home/HomeChecklist'
import { HomeDiscoverSection } from '@/features/home/HomeDiscoverSection'
import { HomeHeroBlock } from '@/features/home/HomeHeroBlock'
import {
  HomeHouseholdRecsWidget,
  HomeTautulliStatsWidget,
  HomeTorrentQueueWidget,
  HomeUnraidSnapshotWidget,
} from '@/features/home/HomeOpsWidgets'
import { HomeQuickSearch } from '@/features/home/HomeQuickSearch'
import { HomeRecentDownloads } from '@/features/home/HomeRecentDownloads'
import { HomeStatusRibbon } from '@/features/home/HomeStatusRibbon'
import { HomeTransferSpeeds } from '@/features/home/HomeTransferSpeeds'
import type { useOverviewSections } from '@/features/overview/useOverviewSections'
import { OverviewQueueSection } from '@/features/overview/OverviewQueueSection'
import { ServiceStatusStrip } from '@/features/overview/ServiceStatusStrip'
import { StorageBandwidthCard } from '@/features/overview/StorageBandwidthCard'
import { UpcomingGroupedList } from '@/features/overview/UpcomingGroupedList'
import { WatchingNowSection } from '@/features/overview/WatchingNowSection'
import { SeerrPendingSection } from '@/features/seerr/SeerrPendingSection'
import type { DemoQueueItem, DemoSeerrRequest } from '@/data/demoDashboard'
import type { DashboardWidgetId, HomeDashboard } from '@/lib/dashboard/dashboard.types'

interface HomeWidgetRendererProps {
  widgetId: DashboardWidgetId
  dashboard: HomeDashboard
  overview: ReturnType<typeof useOverviewSections>
  ribbon: Array<{ label: string; value: string; to: string; accent: string }>
  serviceFilter?: string
  onServiceSelect: (id: string) => void
  onOpenQueueItem: (item: DemoQueueItem) => void
  onOpenSeerr: (request: DemoSeerrRequest) => void
}

export function HomeWidgetRenderer({
  widgetId,
  dashboard,
  overview: o,
  ribbon,
  serviceFilter,
  onServiceSelect,
  onOpenQueueItem,
  onOpenSeerr,
}: HomeWidgetRendererProps) {
  switch (widgetId) {
    case 'hero':
      return (
        <HomeHeroBlock name={dashboard.name} tagline={dashboard.tagline} isDemo={o.isDemo} />
      )
    case 'checklist':
      return <HomeChecklist />
    case 'quickSearch':
      return <HomeQuickSearch />
    case 'statusRibbon':
      return <HomeStatusRibbon items={ribbon} updatedAt={o.queueUpdatedAt} />
    case 'servicesOverview':
      return <ServiceStatusStrip activeId={serviceFilter} onSelect={onServiceSelect} />
    case 'discoverShelves':
      return <HomeDiscoverSection />
    case 'householdRecs':
      return <HomeHouseholdRecsWidget />
    case 'torrentQueue':
      return <HomeTorrentQueueWidget />
    case 'tautulliStats':
      return <HomeTautulliStatsWidget />
    case 'unraidSnapshot':
      return <HomeUnraidSnapshotWidget />
    case 'downloads':
      return o.showQueue ? (
        <OverviewQueueSection
          items={o.queuePreview}
          onOpen={onOpenQueueItem}
          onPause={(item) => void o.pauseOrResume(item, item.status === 'paused')}
          onRemove={(item) => void o.removeItem?.(item)}
          onRetry={(item) => void o.retryItem?.(item)}
        />
      ) : null
    case 'requests':
      return o.showSeerr ? <SeerrPendingSection demo={o.isDemo} onOpen={onOpenSeerr} /> : null
    case 'watching':
      return o.showWatching ? (
        <WatchingNowSection enabled={!o.isDemo && o.showWatching} />
      ) : null
    case 'upcoming':
      return o.showCalendar ? (
        <section className="space-y-3">
          <SectionHeader
            title="Airing & releasing soon"
            count={o.upcoming.length}
            actionLabel="Calendar"
            actionTo="/calendar"
          />
          {o.calendarStatus === 'loading' ? (
            <div className="space-y-2">
              <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
              <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
            </div>
          ) : o.calendarStatus === 'error' ? (
            <EmptyState title="Couldn’t load calendar" description={o.calendarError ?? ''} />
          ) : (
            <UpcomingGroupedList releases={o.upcoming} />
          )}
        </section>
      ) : null
    case 'recentDownloads':
      return <HomeRecentDownloads />
    case 'transferSpeeds':
      return <HomeTransferSpeeds />
    case 'storage':
      return o.showStorage ? <StorageBandwidthCard /> : null
    default:
      return null
  }
}
