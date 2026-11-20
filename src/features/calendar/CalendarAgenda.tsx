import { CalendarDays } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { CalendarEventRow } from '@/features/calendar/CalendarEventRow'
import { formatAgendaLabel } from '@/features/calendar/calendar.helpers'
import type { DemoRelease } from '@/data/demoDashboard'

interface CalendarAgendaProps {
  selectedKey: string
  todayKey: string
  isOnToday: boolean
  dayEvents: DemoRelease[]
  isDemo: boolean
  loading?: boolean
  onJumpToday: () => void
  onToggle: (id: string) => void
  onSearch: (id: string) => void
}

export function CalendarAgenda({
  selectedKey,
  todayKey,
  isOnToday,
  dayEvents,
  isDemo,
  loading = false,
  onJumpToday,
  onToggle,
  onSearch,
}: CalendarAgendaProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            {formatAgendaLabel(selectedKey, todayKey)}
          </h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {dayEvents.length === 0
              ? 'No releases scheduled'
              : `${dayEvents.length} release${dayEvents.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {!isOnToday ? (
          <button
            type="button"
            onClick={onJumpToday}
            className="inline-flex min-h-9 cursor-pointer items-center rounded-[var(--radius-md)] px-2.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-muted)] active:scale-95"
          >
            Jump to today
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-20 rounded-[var(--radius-2xl)]" />
          <div className="skeleton h-20 rounded-[var(--radius-2xl)]" />
        </div>
      ) : dayEvents.length === 0 ? (
        <EmptyState
          compact
          icon={<CalendarDays className="size-5" aria-hidden />}
          title="Nothing airing"
          description={
            isDemo
              ? 'Switch views or select another highlighted date.'
              : 'No monitored releases on this day in the loaded range.'
          }
        />
      ) : (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {dayEvents.map((event) => (
            <CalendarEventRow
              key={event.id}
              event={event}
              onToggle={() => onToggle(event.id)}
              onSearch={() => onSearch(event.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
