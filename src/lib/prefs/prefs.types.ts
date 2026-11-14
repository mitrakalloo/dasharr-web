import type { HomeDashboard } from '@/lib/dashboard/dashboard.types'

export interface DefaultAddPrefs {
  qualityProfileId?: number
  rootFolderPath?: string
  serverId?: number
  prefer4k: boolean
  monitored: boolean
  searchNow: boolean
}

export type ThemePreference = 'system' | 'dark' | 'light'
export type UiDensity = 'comfortable' | 'compact'
export type CalendarViewPref = 'strip' | 'month' | 'agenda'
export type HomeFocus = 'tonight' | 'discover' | 'ops' | 'custom'

export interface ExperiencePrefs {
  watchRegion: string
  themePreference: ThemePreference
  uiDensity: UiDensity
  calendarView: CalendarViewPref
  homeFocus: HomeFocus
  showAdvancedActions: boolean
  notificationsEnabled: boolean
  checklistDismissed: boolean
}

export interface AppPreferences {
  version: 1
  kind: 'dasharr.preferences'
  exportedAt?: string
  defaultAdd: DefaultAddPrefs
  experience: ExperiencePrefs
  dashboards?: HomeDashboard[]
  activeDashboardId?: string
  dashboardLayoutVersion?: number
}

export const DEFAULT_ADD_PREFS: DefaultAddPrefs = {
  prefer4k: false,
  monitored: true,
  searchNow: true,
}

export const DEFAULT_EXPERIENCE: ExperiencePrefs = {
  watchRegion: 'US',
  themePreference: 'dark',
  uiDensity: 'comfortable',
  calendarView: 'strip',
  homeFocus: 'tonight',
  showAdvancedActions: false,
  notificationsEnabled: true,
  checklistDismissed: false,
}
