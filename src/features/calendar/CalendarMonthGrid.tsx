import { CalendarDayCell } from '@/features/calendar/CalendarDayCell'
import type { CalendarDay } from '@/features/calendar/calendar.helpers'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarMonthGridProps {
  days: CalendarDay[]
  selectedKey: string
  onSelect: (dateKey: string) => void
}

export function CalendarMonthGrid({ days, selectedKey, onSelect }: CalendarMonthGridProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <CalendarDayCell
            key={day.dateKey}
            day={day}
            selected={day.dateKey === selectedKey}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
