import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/60 text-center',
        compact ? 'px-4 py-7' : 'px-6 py-11',
        className,
      )}
    >
      <div className="mb-3.5 flex size-12 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)] shadow-[var(--panel-highlight)]">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </div>
      <p className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
        {title}
      </p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        {description}
      </p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="mt-5 inline-flex">
          <Button variant="secondary" size="sm">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
      {actionLabel && onAction && !actionTo ? (
        <div className="mt-5 flex justify-center">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
