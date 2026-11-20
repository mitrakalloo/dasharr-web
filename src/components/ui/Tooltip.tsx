import { cn } from '@/lib/cn'

interface TooltipProps {
  label: string
  children: React.ReactNode
  className?: string
  side?: 'top' | 'bottom'
}

/** Lightweight CSS tooltip for desktop pointer affordances. */
export function Tooltip({ label, children, className, side = 'top' }: TooltipProps) {
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-40 hidden w-max max-w-[240px] -translate-x-1/2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-[var(--color-foreground)] opacity-0 shadow-[var(--elevation-md)] transition-opacity duration-150 group-hover/tooltip:opacity-100 lg:block',
          side === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
        )}
      >
        {label}
      </span>
    </span>
  )
}
