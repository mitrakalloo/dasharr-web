import {
  CalendarDays,
  Clapperboard,
  History,
  Inbox,
  LayoutDashboard,
  Library,
  ListVideo,
  MoreHorizontal,
  Search,
  type LucideIcon,
} from 'lucide-react'

export interface PrimaryNavItem {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
  shortcut?: string
  mobileTab?: boolean
}

/** Parity with native Dasharr tabs: Home · Find · Queue · Schedule · More */
export const PRIMARY_NAV: PrimaryNavItem[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true, shortcut: '1', mobileTab: true },
  { to: '/search', label: 'Find', icon: Search, end: false, shortcut: '2', mobileTab: true },
  { to: '/queue', label: 'Queue', icon: ListVideo, end: false, shortcut: '3', mobileTab: true },
  { to: '/calendar', label: 'Schedule', icon: CalendarDays, end: false, shortcut: '4', mobileTab: true },
  { to: '/more', label: 'More', icon: MoreHorizontal, end: false, shortcut: '5', mobileTab: true },
  { to: '/requests', label: 'Requests', icon: Inbox, end: false, shortcut: '6' },
  { to: '/library', label: 'Library', icon: Library, end: false, shortcut: '7' },
  { to: '/wanted', label: 'Wanted', icon: Clapperboard, end: false, shortcut: '8' },
  { to: '/history', label: 'History', icon: History, end: false, shortcut: '9' },
]

export const MOBILE_TABS = PRIMARY_NAV.filter((item) => item.mobileTab)

export const RAIL_COLLAPSED_KEY = 'dasharr-rail-collapsed'
