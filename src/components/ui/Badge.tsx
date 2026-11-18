import { cn } from '@/lib/cn'
import { withAlpha } from '@/lib/serviceColors'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const toneStyles = {
  neutral: '',
  success:
    'border-[var(--color-success)]/30 bg-[var(--color-success)]/12 text-[var(--color-success)]',
  warning:
    'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/12 text-[var(--color-warning)]',
  danger:
    'border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/12 text-[var(--color-destructive)]',
  info: 'border-[var(--color-info)]/30 bg-[var(--color-info)]/12 text-[var(--color-info)]',
}

export function Badge({ children, color, className, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white/5 px-2 py-0.5 text-[11px] font-medium capitalize tracking-wide text-[var(--color-muted-foreground)]',
        !color && toneStyles[tone],
        className,
      )}
      style={
        color
          ? {
              color,
              borderColor: withAlpha(color, '55'),
              backgroundColor: withAlpha(color, '18'),
            }
          : undefined
      }
    >
      {children}
    </span>
  )
}
