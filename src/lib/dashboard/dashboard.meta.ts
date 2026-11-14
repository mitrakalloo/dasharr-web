import type { DashboardWidgetId } from '@/lib/dashboard/dashboard.types'

export interface DashboardWidgetMeta {
  id: DashboardWidgetId
  label: string
  description: string
  group: 'core' | 'media' | 'downloads' | 'tautulli'
}

export const DASHBOARD_WIDGET_META: DashboardWidgetMeta[] = [
  { id: 'hero', label: 'Hero', description: 'Desk title and tagline', group: 'core' },
  { id: 'checklist', label: 'Setup checklist', description: 'First-run stack tips', group: 'core' },
  { id: 'quickSearch', label: 'Quick search', description: 'Jump into Find', group: 'core' },
  {
    id: 'statusRibbon',
    label: 'Status ribbon',
    description: 'Queue, requests, watching, online',
    group: 'core',
  },
  {
    id: 'servicesOverview',
    label: 'Services overview',
    description: 'Health strip for configured services',
    group: 'core',
  },
  {
    id: 'discoverShelves',
    label: 'Discover shelves',
    description: 'Trending / popular posters from Seerr',
    group: 'media',
  },
  {
    id: 'householdRecs',
    label: 'For your household',
    description: 'Picks from Tautulli history + Seerr',
    group: 'media',
  },
  { id: 'downloads', label: 'Downloads', description: 'Live download queue preview', group: 'downloads' },
  {
    id: 'torrentQueue',
    label: 'Torrent queue',
    description: 'Top active torrents',
    group: 'downloads',
  },
  {
    id: 'tautulliStats',
    label: 'Tautulli stats',
    description: 'Active stream count',
    group: 'tautulli',
  },
  {
    id: 'unraidSnapshot',
    label: 'Unraid snapshot',
    description: 'Array state and capacity',
    group: 'core',
  },
  { id: 'requests', label: 'Requests', description: 'Pending Seerr approvals', group: 'media' },
  { id: 'watching', label: 'Watching now', description: 'Active Tautulli streams', group: 'tautulli' },
  { id: 'upcoming', label: 'Upcoming', description: 'Next airings and releases', group: 'media' },
  {
    id: 'recentDownloads',
    label: 'Recently downloaded',
    description: 'Latest Radarr / Sonarr imports',
    group: 'downloads',
  },
  {
    id: 'transferSpeeds',
    label: 'Transfer speeds',
    description: 'Aggregate download throughput',
    group: 'downloads',
  },
  {
    id: 'storage',
    label: 'Storage',
    description: 'Disk space from *arr apps',
    group: 'downloads',
  },
]
