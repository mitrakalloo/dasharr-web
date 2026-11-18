import { cn } from '@/lib/cn'

interface DasharrMarkProps {
  className?: string
  title?: string
}

export function DasharrMark({ className, title = 'Dasharr' }: DasharrMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8 shrink-0', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="dasharr-mark-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#161d2a" />
          <stop offset="100%" stopColor="#0e131c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#dasharr-mark-fill)" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="9.5"
        fill="none"
        stroke="rgba(238,242,247,0.1)"
      />
      <path
        d="M8 22.5V9.5L16 6l8 3.5v13L16 26l-8-3.5Z"
        fill="none"
        stroke="#5B9DFF"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 8.25v15.5M8.75 10.5 16 13.75l7.25-3.25"
        stroke="rgba(238,242,247,0.5)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16.5" r="1.7" fill="#5B9DFF" />
    </svg>
  )
}

interface DasharrWordmarkProps {
  compact?: boolean
  className?: string
}

export function DasharrWordmark({ compact = false, className }: DasharrWordmarkProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <DasharrMark className={compact ? 'size-7' : 'size-8'} />
      <div className="min-w-0">
        <p
          className={cn(
            'font-display truncate tracking-tight text-[var(--color-foreground)]',
            compact ? 'text-sm font-semibold' : 'text-base font-bold',
          )}
        >
          Dasharr
        </p>
        {!compact ? (
          <p className="truncate text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)]">
            Signal desk
          </p>
        ) : null}
      </div>
    </div>
  )
}
