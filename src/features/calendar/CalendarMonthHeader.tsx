import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'

interface CalendarMonthHeaderProps {
  label: string
  isOnToday: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarMonthHeader({
  label,
  isOnToday,
  onPrev,
  onNext,
  onToday,
}: CalendarMonthHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--color-hairline)] pb-3">
      <h2 className="font-display text-base font-semibold tracking-tight">{label}</h2>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToday}
          className={cn(
            'min-h-9 cursor-pointer rounded-[var(--radius-md)] border px-3 text-xs font-semibold transition-colors active:scale-95',
            isOnToday
              ? 'border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
              : 'border-[var(--color-primary)]/35 bg-[var(--color-primary-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]',
          )}
        >
          Today
        </button>
        <IconButton label="Previous month" size="sm" onClick={onPrev}>
          <ChevronLeft className="size-4.5" />
        </IconButton>
        <IconButton label="Next month" size="sm" onClick={onNext}>
          <ChevronRight className="size-4.5" />
        </IconButton>
      </div>
    </div>
  )
}
