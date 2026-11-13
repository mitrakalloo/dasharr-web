import type { DemoRelease } from '@/data/demoDashboard'
import { serviceAccent } from '@/lib/serviceColors'
import { cn } from '@/lib/cn'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface CalendarStripDayProps {
  date: Date
  dateKey: string
  selected: boolean
  isToday: boolean
  events: DemoRelease[]
  onSelect: (dateKey: string) => void
}

export function CalendarStripDay({
  date,
  dateKey,
  selected,
  isToday,
  events,
  onSelect,
}: CalendarStripDayProps) {
  const kinds = Array.from(new Set(events.map((event) => event.service))).slice(0, 3)

  return (
    <button
      type="button"
      data-date-key={dateKey}
      aria-pressed={selected}
      aria-label={`${dateKey}${events.length ? `, ${events.length} releases` : ''}`}
      onClick={() => onSelect(dateKey)}
      className={cn(
        'flex w-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-2 transition active:scale-95',
        selected && 'border-white bg-white text-black',
        !selected && isToday && 'border-sky-400/50 bg-sky-400/15 text-sky-200',
        !selected &&
          !isToday &&
          'border-[var(--color-border-strong)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
      )}
    >
      <span className={cn('text-xs font-medium', selected && 'text-black/70')}>
        {WEEKDAYS[date.getDay()]}
      </span>
      <span
        className={cn(
          'tabular text-lg font-semibold leading-none',
          selected ? 'text-black' : 'text-[var(--color-foreground)]',
        )}
      >
        {date.getDate()}
      </span>
      <span className="flex h-1.5 items-center gap-0.5">
        {kinds.map((kind) => (
          <span
            key={`${dateKey}-${kind}`}
            className="size-1 rounded-full"
            style={{ backgroundColor: selected ? '#09090b' : serviceAccent(kind) }}
          />
        ))}
      </span>
    </button>
  )
}
