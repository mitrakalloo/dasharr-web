import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/50 px-5 py-10 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </div>
      <p className="font-display text-base font-semibold tracking-tight">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-muted-foreground)]">{description}</p>
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
