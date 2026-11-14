export type DashboardWidgetId =
  | 'hero'
  | 'checklist'
  | 'quickSearch'
  | 'statusRibbon'
  | 'servicesOverview'
  | 'discoverShelves'
  | 'householdRecs'
  | 'downloads'
  | 'requests'
  | 'watching'
  | 'upcoming'
  | 'recentDownloads'
  | 'transferSpeeds'
  | 'storage'
  | 'torrentQueue'
  | 'tautulliStats'
  | 'unraidSnapshot'

export interface DashboardWidgetConfig {
  id: DashboardWidgetId
  enabled: boolean
}

export interface HomeDashboard {
  id: string
  name: string
  tagline?: string
  widgets: DashboardWidgetConfig[]
}

export interface DashboardPreferences {
  version: 1
  layoutVersion: number
  dashboards: HomeDashboard[]
  activeDashboardId: string
}
