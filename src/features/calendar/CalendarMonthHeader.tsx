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
    <div className="space-y-3 border-b border-[var(--color-border)] pb-3">
      <div className="flex items-center gap-2">
        <IconButton label="Previous month" onClick={onPrev}>
          <ChevronLeft className="size-5" />
        </IconButton>
        <h2 className="flex-1 text-center text-base font-semibold tracking-tight">{label}</h2>
        <IconButton label="Next month" onClick={onNext}>
          <ChevronRight className="size-5" />
        </IconButton>
      </div>
      <button
        type="button"
        onClick={onToday}
        className={cn(
          'mx-auto flex min-h-10 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm font-medium transition active:scale-95',
          isOnToday
            ? 'border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
            : 'border-sky-400/30 bg-sky-400/10 text-sky-300',
        )}
      >
        Today
      </button>
    </div>
  )
}
