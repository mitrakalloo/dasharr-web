import { SegmentedControl } from '@/components/ui/SegmentedControl'
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
    <SegmentedControl
      ariaLabel="Calendar view"
      variant="segmented"
      size="sm"
      value={value}
      onChange={onChange}
      options={OPTIONS}
    />
  )
}
