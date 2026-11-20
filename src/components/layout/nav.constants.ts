import {
  Activity,
  CalendarDays,
  Captions,
  Clapperboard,
  Compass,
  FolderInput,
  HardDrive,
  History,
  Inbox,
  LayoutDashboard,
  Library,
  ListVideo,
  MoreHorizontal,
  Radar,
  Search,
  type LucideIcon,
} from 'lucide-react'

import type { ServiceType } from '@/types/config'

export interface PrimaryNavItem {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
  shortcut?: string
  mobileTab?: boolean
  desktopHidden?: boolean
  requiresService?: ServiceType[]
  section: 'workspace' | 'library'
}

export interface GChordItem {
  key: string
  to: string
  label: string
}

/** Parity with native Dasharr mobile tabs: Home · Find · Queue · Schedule · More */
export const PRIMARY_NAV: PrimaryNavItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: LayoutDashboard,
    end: true,
    shortcut: '1',
    mobileTab: true,
    section: 'workspace',
  },
  {
    to: '/search',
    label: 'Find',
    icon: Search,
    end: false,
    shortcut: '2',
    mobileTab: true,
    section: 'workspace',
  },
  {
    to: '/discover',
    label: 'Discover',
    icon: Compass,
    end: false,
    requiresService: ['seerr'],
    section: 'workspace',
  },
  {
    to: '/queue',
    label: 'Queue',
    icon: ListVideo,
    end: false,
    shortcut: '3',
    mobileTab: true,
    section: 'workspace',
  },
  {
    to: '/calendar',
    label: 'Schedule',
    icon: CalendarDays,
    end: false,
    shortcut: '4',
    mobileTab: true,
    section: 'workspace',
  },
  {
    to: '/more',
    label: 'More',
    icon: MoreHorizontal,
    end: false,
    mobileTab: true,
    desktopHidden: true,
    section: 'library',
  },
  {
    to: '/requests',
    label: 'Requests',
    icon: Inbox,
    end: false,
    shortcut: '5',
    section: 'library',
  },
  {
    to: '/library',
    label: 'Library',
    icon: Library,
    end: false,
    shortcut: '6',
    section: 'library',
  },
  {
    to: '/wanted',
    label: 'Wanted',
    icon: Clapperboard,
    end: false,
    shortcut: '7',
    section: 'library',
  },
  {
    to: '/history',
    label: 'History',
    icon: History,
    end: false,
    shortcut: '8',
    section: 'library',
  },
  {
    to: '/indexers',
    label: 'Indexers',
    icon: Radar,
    end: false,
    shortcut: '9',
    section: 'library',
  },
  {
    to: '/subtitles',
    label: 'Subtitles',
    icon: Captions,
    end: false,
    requiresService: ['bazarr'],
    section: 'library',
  },
  {
    to: '/activity',
    label: 'Activity',
    icon: Activity,
    end: false,
    requiresService: ['tautulli'],
    section: 'library',
  },
  {
    to: '/storage',
    label: 'Storage',
    icon: HardDrive,
    end: false,
    section: 'library',
  },
  {
    to: '/manual-import',
    label: 'Manual import',
    icon: FolderInput,
    end: false,
    requiresService: ['sonarr', 'radarr', 'lidarr'],
    section: 'library',
  },
]

export const G_CHORDS: GChordItem[] = [
  { key: 'h', to: '/', label: 'Home' },
  { key: 'f', to: '/search', label: 'Find' },
  { key: 'd', to: '/discover', label: 'Discover' },
  { key: 'q', to: '/queue', label: 'Queue' },
  { key: 'c', to: '/calendar', label: 'Schedule' },
  { key: 'r', to: '/requests', label: 'Requests' },
  { key: 'l', to: '/library', label: 'Library' },
  { key: 'w', to: '/wanted', label: 'Wanted' },
  { key: 'y', to: '/history', label: 'History' },
  { key: 'i', to: '/indexers', label: 'Indexers' },
  { key: 'b', to: '/subtitles', label: 'Subtitles' },
  { key: 'a', to: '/activity', label: 'Activity' },
  { key: 't', to: '/storage', label: 'Storage' },
  { key: 'm', to: '/manual-import', label: 'Manual import' },
  { key: 's', to: '/settings', label: 'Settings' },
]

export const MOBILE_TABS = PRIMARY_NAV.filter((item) => item.mobileTab)
export const WORKSPACE_NAV = PRIMARY_NAV.filter(
  (item) => item.section === 'workspace' && !item.desktopHidden,
)
export const LIBRARY_NAV = PRIMARY_NAV.filter(
  (item) => item.section === 'library' && !item.desktopHidden,
)

export const RAIL_COLLAPSED_KEY = 'dasharr-rail-collapsed'

export function routeMetaForPath(pathname: string): { title: string; subtitle: string } {
  if (pathname === '/') return { title: 'Home', subtitle: 'Media command center' }
  if (pathname.startsWith('/search')) return { title: 'Find', subtitle: 'Search & discover' }
  if (pathname.startsWith('/discover')) return { title: 'Discover', subtitle: 'Trending movies & series' }
  if (pathname.startsWith('/queue')) return { title: 'Queue', subtitle: 'Active transfers & streams' }
  if (pathname.startsWith('/calendar')) return { title: 'Schedule', subtitle: 'Upcoming releases' }
  if (pathname.startsWith('/requests')) return { title: 'Requests', subtitle: 'Household approvals' }
  if (pathname.startsWith('/library')) return { title: 'Library', subtitle: 'Configured *arr catalog' }
  if (pathname.startsWith('/wanted')) return { title: 'Wanted', subtitle: 'Missing & cutoff unmet' }
  if (pathname.startsWith('/history')) return { title: 'History', subtitle: 'Grabs & imports' }
  if (pathname.startsWith('/indexers')) return { title: 'Indexers', subtitle: 'Prowlarr release search' }
  if (pathname.startsWith('/subtitles')) return { title: 'Subtitles', subtitle: 'Bazarr missing subtitles' }
  if (pathname.startsWith('/activity')) return { title: 'Activity', subtitle: 'Streams, history & stats' }
  if (pathname.startsWith('/storage')) return { title: 'Storage', subtitle: 'Volumes & largest media' }
  if (pathname.startsWith('/manual-import')) return { title: 'Manual import', subtitle: 'Unmapped downloads' }
  if (pathname.startsWith('/service/')) return { title: 'Service', subtitle: 'Live control hub' }
  if (pathname.startsWith('/edit-home')) return { title: 'Edit desks', subtitle: 'Customize home widgets' }
  if (pathname.startsWith('/settings')) return { title: 'Settings', subtitle: 'Stack, theme & account' }
  if (pathname.startsWith('/more')) return { title: 'More', subtitle: 'Tools, services & ops' }
  return { title: 'Dasharr', subtitle: 'Signal desk' }
}
