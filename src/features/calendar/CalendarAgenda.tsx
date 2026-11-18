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
    <section className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{formatAgendaLabel(selectedKey, todayKey)}</h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {dayEvents.length === 0
              ? 'No releases this day'
              : `${dayEvents.length} release${dayEvents.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {!isOnToday ? (
          <button
            type="button"
            onClick={onJumpToday}
            className="min-h-10 cursor-pointer text-sm font-medium text-sky-300 active:scale-95"
          >
            Jump to today
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="px-1 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
          Loading releases…
        </p>
      ) : dayEvents.length === 0 ? (
        <EmptyState
          title="Nothing airing"
          description={
            isDemo
              ? 'Switch views or pick another date.'
              : 'No monitored releases on this day in the loaded range.'
          }
        />
      ) : (
        <div className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3">
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
