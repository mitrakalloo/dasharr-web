import { useEffect, useMemo, useState } from 'react'

import { DEMO_RELEASES, type DemoRelease } from '@/data/demoDashboard'
import {
  addMonths,
  buildDayStrip,
  buildMonthGrid,
  eventDateKey,
  parseDateKey,
  toDateKey,
  type CalendarViewMode,
} from '@/features/calendar/calendar.helpers'

const STRIP_BEFORE = 10
const STRIP_AFTER = 40
const VIEW_STORAGE_KEY = 'dasharr-calendar-view'

function readStoredView(): CalendarViewMode {
  try {
    const value = localStorage.getItem(VIEW_STORAGE_KEY)
    if (value === 'month' || value === 'strip') return value
  } catch {
    // ignore
  }
  return 'month'
}

export function useCalendarState(sourceEvents: DemoRelease[] = DEMO_RELEASES) {
  const todayKey = toDateKey(new Date())
  const [view, setViewState] = useState<CalendarViewMode>(readStoredView)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [stripCenter, setStripCenter] = useState(() => new Date())
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const [events, setEvents] = useState(sourceEvents)

  useEffect(() => {
    setEvents(sourceEvents)
  }, [sourceEvents])

  const days = useMemo(
    () => buildMonthGrid(month, events, todayKey),
    [month, events, todayKey],
  )

  const stripDays = useMemo(
    () => buildDayStrip(stripCenter, STRIP_BEFORE, STRIP_AFTER),
    [stripCenter],
  )

  const dayEvents = useMemo(
    () =>
      events
        .filter((event) => eventDateKey(event) === selectedKey)
        .sort((a, b) => new Date(a.airDate).getTime() - new Date(b.airDate).getTime()),
    [events, selectedKey],
  )

  function setView(next: CalendarViewMode) {
    setViewState(next)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  function selectDay(dateKey: string) {
    setSelectedKey(dateKey)
    const date = parseDateKey(dateKey)
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    setStripCenter(date)
  }

  function jumpToday() {
    const now = new Date()
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setStripCenter(now)
    setSelectedKey(todayKey)
  }

  function toggleMonitored(id: string) {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, monitored: !event.monitored } : event,
      ),
    )
  }

  return {
    view,
    setView,
    todayKey,
    month,
    selectedKey,
    days,
    stripDays,
    events,
    dayEvents,
    isOnToday: selectedKey === todayKey,
    selectDay,
    prevMonth: () => setMonth((prev) => addMonths(prev, -1)),
    nextMonth: () => setMonth((prev) => addMonths(prev, 1)),
    jumpToday,
    toggleMonitored,
  }
}
