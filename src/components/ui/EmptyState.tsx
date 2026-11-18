import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/40 px-4 py-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="mt-4 inline-flex">
          <Button variant="secondary" className="min-h-10 px-4 text-xs">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
      {actionLabel && onAction && !actionTo ? (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" className="min-h-10 px-4 text-xs" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
