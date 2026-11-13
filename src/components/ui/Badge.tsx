import { cn } from '@/lib/cn'
import { withAlpha } from '@/lib/serviceColors'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-[var(--color-border)] bg-white/5 px-2 py-0.5 text-xs font-medium capitalize text-[var(--color-muted-foreground)]',
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
