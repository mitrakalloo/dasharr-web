import { cn } from '@/lib/cn'
import type { CalendarViewMode } from '@/features/calendar/calendar.helpers'

interface CalendarViewToggleProps {
  value: CalendarViewMode
  onChange: (next: CalendarViewMode) => void
}

const OPTIONS: Array<{ value: CalendarViewMode; label: string }> = [
  { value: 'strip', label: 'Days' },
  { value: 'month', label: 'Month' },
]

export function CalendarViewToggle({ value, onChange }: CalendarViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Calendar view"
      className="inline-flex rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-muted)] p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-10 min-w-[72px] cursor-pointer rounded-lg px-3 text-sm font-medium transition active:scale-95',
              active
                ? 'bg-white text-black'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
