import { DASHBOARD_WIDGET_META } from '@/lib/dashboard/dashboard.meta'
import type {
  DashboardWidgetConfig,
  DashboardWidgetId,
  HomeDashboard,
} from '@/lib/dashboard/dashboard.types'

/** Bump when built-in desks should reapply for existing installs. */
export const DASHBOARD_LAYOUT_VERSION = 2

const ALL_IDS = DASHBOARD_WIDGET_META.map((item) => item.id)

function widgetsFrom(enabled: DashboardWidgetId[]): DashboardWidgetConfig[] {
  const enabledSet = new Set(enabled)
  const ordered = [...enabled, ...ALL_IDS.filter((id) => !enabledSet.has(id))]
  return ordered.map((id) => ({ id, enabled: enabledSet.has(id) }))
}

export function createDashboardId(): string {
  return `dash-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Tonight · Discover · Ops — mirrors native Dasharr content-first desks. */
export function defaultDashboards(): HomeDashboard[] {
  return [
    {
      id: 'tonight',
      name: 'Tonight',
      tagline: 'What to watch, what’s airing, and who’s streaming.',
      widgets: widgetsFrom([
        'hero',
        'checklist',
        'quickSearch',
        'statusRibbon',
        'householdRecs',
        'watching',
        'upcoming',
        'requests',
        'downloads',
      ]),
    },
    {
      id: 'discover',
      name: 'Discover',
      tagline: 'Browse popular and upcoming titles, then request what you want.',
      widgets: widgetsFrom([
        'hero',
        'quickSearch',
        'householdRecs',
        'discoverShelves',
        'upcoming',
        'recentDownloads',
        'requests',
      ]),
    },
    {
      id: 'ops',
      name: 'Ops',
      tagline: 'Queue health, transfers, and the stack at a glance.',
      widgets: widgetsFrom([
        'hero',
        'statusRibbon',
        'servicesOverview',
        'transferSpeeds',
        'storage',
        'downloads',
        'torrentQueue',
        'recentDownloads',
        'watching',
        'tautulliStats',
        'unraidSnapshot',
      ]),
    },
  ]
}
