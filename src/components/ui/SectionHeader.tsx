import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'

interface SectionHeaderProps {
  title: string
  description?: string
  count?: number
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  trailing?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  count,
  actionLabel,
  actionTo,
  onAction,
  trailing,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-display truncate text-[15px] font-semibold tracking-tight text-[var(--color-foreground)]">
            {title}
          </h2>
          {typeof count === 'number' ? (
            <span className="tabular rounded-full border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted-foreground)]">
              {count}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
            {description}
          </p>
        ) : null}
      </div>

      {trailing ? (
        <div className="shrink-0">{trailing}</div>
      ) : actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="group inline-flex min-h-9 shrink-0 items-center gap-1 rounded-[var(--radius-md)] px-2 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-muted)]"
        >
          <span>{actionLabel}</span>
          <ChevronRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      ) : actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="group inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1 rounded-[var(--radius-md)] px-2 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-muted)]"
        >
          <span>{actionLabel}</span>
          <ChevronRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  )
}
