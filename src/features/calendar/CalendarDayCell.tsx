import type { CalendarDay } from '@/features/calendar/calendar.helpers'
import { serviceAccent } from '@/lib/serviceColors'
import { cn } from '@/lib/cn'

interface CalendarDayCellProps {
  day: CalendarDay
  selected: boolean
  onSelect: (dateKey: string) => void
}

export function CalendarDayCell({ day, selected, onSelect }: CalendarDayCellProps) {
  const kinds = Array.from(new Set(day.events.map((event) => event.service))).slice(0, 3)
  const hasEvents = day.events.length > 0

  return (
    <button
      type="button"
      onClick={() => onSelect(day.dateKey)}
      aria-label={`${day.dateKey}${hasEvents ? `, ${day.events.length} releases` : ''}`}
      aria-pressed={selected}
      className="flex min-h-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl transition active:scale-95"
    >
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-full text-sm font-medium tabular',
          selected && 'bg-white text-black',
          !selected && day.isToday && 'border border-sky-400 bg-sky-400/15 text-sky-200',
          !selected && !day.isToday && day.inMonth && hasEvents && 'text-[var(--color-foreground)]',
          !selected &&
            !day.isToday &&
            day.inMonth &&
            !hasEvents &&
            'text-[var(--color-muted-foreground)]',
          !day.inMonth && 'text-[var(--color-muted-foreground)]/45',
        )}
      >
        {day.dayNumber}
      </span>
      <span className="flex h-1.5 items-center gap-0.5">
        {kinds.map((kind) => (
          <span
            key={`${day.dateKey}-${kind}`}
            className="size-1 rounded-full"
            style={{ backgroundColor: serviceAccent(kind), opacity: day.inMonth ? 1 : 0.45 }}
          />
        ))}
      </span>
    </button>
  )
}
