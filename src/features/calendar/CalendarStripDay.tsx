import type { DemoRelease } from '@/data/demoDashboard'
import { serviceAccent } from '@/lib/serviceColors'
import { cn } from '@/lib/cn'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
        'flex w-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[var(--radius-xl)] border px-1 py-2.5 transition-all active:scale-95',
        selected &&
          'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--elevation-glow)]',
        !selected &&
          isToday &&
          'border-[var(--color-primary)]/45 bg-[var(--color-primary-muted)] text-[var(--color-primary)]',
        !selected &&
          !isToday &&
          'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)]',
      )}
    >
      <span
        className={cn(
          'text-[10px] font-semibold uppercase tracking-wider',
          selected ? 'text-[var(--color-on-primary)]/80' : undefined,
        )}
      >
        {WEEKDAYS[date.getDay()]}
      </span>
      <span
        className={cn(
          'tabular text-lg font-semibold leading-none',
          selected ? 'text-[var(--color-on-primary)]' : 'text-[var(--color-foreground)]',
        )}
      >
        {date.getDate()}
      </span>
      <span className="flex h-1.5 items-center gap-0.5">
        {kinds.map((kind) => (
          <span
            key={`${dateKey}-${kind}`}
            className="size-1.5 rounded-full"
            style={{
              backgroundColor: selected ? 'rgba(255,255,255,0.9)' : serviceAccent(kind),
            }}
          />
        ))}
      </span>
    </button>
  )
}
