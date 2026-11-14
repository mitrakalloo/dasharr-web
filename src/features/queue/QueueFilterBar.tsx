import { LayoutGroup, motion } from 'motion/react'

import type { QueueFilter } from '@/features/queue/useQueuePage'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface QueueFilterBarProps {
  filters: readonly QueueFilter[]
  value: QueueFilter
  onChange: (value: QueueFilter) => void
}

export function QueueFilterBar({ filters, value, onChange }: QueueFilterBarProps) {
  return (
    <LayoutGroup id="queue-filters">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={cn(
              'relative min-h-[var(--tap)] shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium capitalize transition active:scale-95',
              value === filter
                ? 'border-transparent text-[var(--color-on-primary-container)]'
                : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]',
            )}
          >
            {value === filter ? (
              <motion.span
                layoutId="queue-filter-pill"
                className="absolute inset-0 rounded-full bg-[var(--color-primary-container)]"
                transition={spring}
              />
            ) : null}
            <span className="relative z-10">{filter}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  )
}
