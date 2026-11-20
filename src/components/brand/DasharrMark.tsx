import { useId } from 'react'

import { cn } from '@/lib/cn'

interface DasharrMarkProps {
  className?: string
  title?: string
}

export function DasharrMark({ className, title = 'Dasharr' }: DasharrMarkProps) {
  const uid = useId()
  const fillId = `dasharr-fill-${uid}`
  const strokeId = `dasharr-stroke-${uid}`

  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8 shrink-0', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#182235" />
          <stop offset="100%" stopColor="#0b101b" />
        </linearGradient>
        <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9.5" fill={`url(#${fillId})`} />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="9"
        fill="none"
        stroke="rgba(148,163,184,0.22)"
      />
      <path
        d="M8.5 22V10L16 6.25 23.5 10v12L16 25.75 8.5 22Z"
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 8.5v15M9.25 10.75 16 14l6.75-3.25"
        stroke="rgba(226,232,240,0.45)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16.5" r="2" fill="#60a5fa" />
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
            'font-display truncate leading-none tracking-tight text-[var(--color-foreground)]',
            compact ? 'text-[15px] font-semibold' : 'text-[16px] font-bold',
          )}
        >
          Dasharr
        </p>
        {!compact ? (
          <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
            Signal desk
          </p>
        ) : null}
      </div>
    </div>
  )
}
