import type { DemoRelease } from '@/data/demoDashboard'

export type CalendarDay = {
  dateKey: string
  dayNumber: number
  inMonth: boolean
  isToday: boolean
  events: DemoRelease[]
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(1)
  next.setMonth(next.getMonth() + amount)
  return next
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

/** Horizontal strip of consecutive days around an anchor date. */
export function buildDayStrip(anchor: Date, before: number, after: number): Date[] {
  const start = addDays(anchor, -before)
  start.setHours(0, 0, 0, 0)
  const total = before + after + 1
  return Array.from({ length: total }, (_, index) => addDays(start, index))
}

export type CalendarViewMode = 'month' | 'strip'

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function formatAgendaLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'Today'
  const tomorrow = parseDateKey(todayKey)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (dateKey === toDateKey(tomorrow)) return 'Tomorrow'
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function eventDateKey(release: DemoRelease): string {
  return toDateKey(new Date(release.airDate))
}

export function buildMonthGrid(
  month: Date,
  events: DemoRelease[],
  todayKey: string,
): CalendarDay[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const first = new Date(year, monthIndex, 1)
  const startOffset = first.getDay()
  const gridStart = new Date(year, monthIndex, 1 - startOffset)

  const byDay = new Map<string, DemoRelease[]>()
  for (const event of events) {
    const key = eventDateKey(event)
    const list = byDay.get(key) ?? []
    list.push(event)
    byDay.set(key, list)
  }

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const dateKey = toDateKey(date)
    const dayEvents = (byDay.get(dateKey) ?? []).slice().sort((a, b) => {
      return new Date(a.airDate).getTime() - new Date(b.airDate).getTime()
    })
    return {
      dateKey,
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
      isToday: dateKey === todayKey,
      events: dayEvents,
    }
  })
}

export function relativeWhenLabel(iso: string, todayKey: string): string {
  const key = toDateKey(new Date(iso))
  const time = formatEventTime(iso)
  if (key === todayKey) return `Tonight · ${time}`
  const tomorrow = parseDateKey(todayKey)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (key === toDateKey(tomorrow)) return `Tomorrow · ${time}`
  return `${parseDateKey(key).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} · ${time}`
}
