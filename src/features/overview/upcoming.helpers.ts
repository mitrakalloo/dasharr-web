import type { DemoRelease } from '@/data/demoDashboard'
import { toDateKey } from '@/features/calendar/calendar.helpers'

export type UpcomingGroup = {
  id: 'today' | 'tomorrow' | 'week'
  label: string
  items: DemoRelease[]
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function groupUpcomingReleases(releases: DemoRelease[]): UpcomingGroup[] {
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)
  const weekEnd = addDays(today, 7)
  const todayKey = toDateKey(today)
  const tomorrowKey = toDateKey(tomorrow)

  const groups: UpcomingGroup[] = [
    { id: 'today', label: 'Today', items: [] },
    { id: 'tomorrow', label: 'Tomorrow', items: [] },
    { id: 'week', label: 'This Week', items: [] },
  ]

  for (const release of releases) {
    const key = toDateKey(new Date(release.airDate))
    const day = startOfDay(new Date(release.airDate))
    if (key === todayKey) groups[0].items.push(release)
    else if (key === tomorrowKey) groups[1].items.push(release)
    else if (day > tomorrow && day < weekEnd) groups[2].items.push(release)
  }

  return groups.filter((group) => group.items.length > 0)
}
