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
      <rect width="32" height="32" rx="9" fill="#121826" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="8.5"
        fill="none"
        stroke="rgba(248,250,252,0.08)"
      />
      <path
        d="M8 22.5V9.5L16 6l8 3.5v13L16 26l-8-3.5Z"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 8.25v15.5M8.75 10.5 16 13.75l7.25-3.25"
        stroke="rgba(241,245,249,0.55)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16.5" r="1.6" fill="#3B82F6" />
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
            compact ? 'text-sm font-bold' : 'text-base font-extrabold',
          )}
        >
          Dasharr
        </p>
        {!compact ? (
          <p className="truncate text-[11px] text-[var(--color-muted-foreground)]">Web</p>
        ) : null}
      </div>
    </div>
  )
}
