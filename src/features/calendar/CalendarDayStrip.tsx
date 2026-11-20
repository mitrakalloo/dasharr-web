import { useEffect, useMemo, useRef } from 'react'

import { CalendarStripDay } from '@/features/calendar/CalendarStripDay'
import { toDateKey } from '@/features/calendar/calendar.helpers'
import type { DemoRelease } from '@/data/demoDashboard'
import { cn } from '@/lib/cn'

interface CalendarDayStripProps {
  days: Date[]
  selectedKey: string
  todayKey: string
  events: DemoRelease[]
  onSelect: (dateKey: string) => void
  onToday: () => void
}

export function CalendarDayStrip({
  days,
  selectedKey,
  todayKey,
  events,
  onSelect,
  onToday,
}: CalendarDayStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, DemoRelease[]>()
    for (const event of events) {
      const key = toDateKey(new Date(event.airDate))
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    return map
  }, [events])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const cell = root.querySelector<HTMLElement>(`[data-date-key="${selectedKey}"]`)
    cell?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedKey, days.length])

  const needsJump = selectedKey !== todayKey

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold tracking-tight">Upcoming days</h2>
        <button
          type="button"
          onClick={onToday}
          className={cn(
            'min-h-9 cursor-pointer rounded-[var(--radius-md)] border px-3 text-xs font-semibold transition-colors active:scale-95',
            needsJump
              ? 'border-[var(--color-primary)]/35 bg-[var(--color-primary-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]'
              : 'border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
          )}
        >
          Today
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {days.map((date) => {
          const dateKey = toDateKey(date)
          return (
            <CalendarStripDay
              key={dateKey}
              date={date}
              dateKey={dateKey}
              selected={dateKey === selectedKey}
              isToday={dateKey === todayKey}
              events={eventsByDay.get(dateKey) ?? []}
              onSelect={onSelect}
            />
          )
        })}
      </div>
    </div>
  )
}
