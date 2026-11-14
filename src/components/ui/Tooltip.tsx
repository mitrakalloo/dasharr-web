import { cn } from '@/lib/cn'

interface TooltipProps {
  label: string
  children: React.ReactNode
  className?: string
}

/** Lightweight CSS tooltip for desktop pointer affordances. */
export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-2.5 py-1.5 text-[11px] leading-snug text-[var(--color-foreground)] opacity-0 shadow-lg transition group-hover/tooltip:opacity-100 lg:block"
      >
        {label}
      </span>
    </span>
  )
}
