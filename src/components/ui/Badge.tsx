import { cn } from '@/lib/cn'
import { withAlpha } from '@/lib/serviceColors'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  dot?: boolean
}

const toneStyles = {
  neutral:
    'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-muted-foreground)]',
  primary:
    'border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] text-[var(--color-primary)]',
  success:
    'border-[var(--color-success)]/30 bg-[var(--color-success-muted)] text-[var(--color-success)]',
  warning:
    'border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
  danger:
    'border-[var(--color-destructive)]/30 bg-[var(--color-destructive-muted)] text-[var(--color-destructive)]',
  info: 'border-[var(--color-info)]/30 bg-[var(--color-info-muted)] text-[var(--color-info)]',
}

export function Badge({
  children,
  color,
  className,
  tone = 'neutral',
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide',
        !color && toneStyles[tone],
        className,
      )}
      style={
        color
          ? {
              color,
              borderColor: withAlpha(color, '45'),
              backgroundColor: withAlpha(color, '16'),
            }
          : undefined
      }
    >
      {dot ? (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color ?? 'currentColor' }}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  )
}
