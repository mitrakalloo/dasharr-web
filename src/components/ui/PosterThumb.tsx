import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import { withAlpha } from '@/lib/serviceColors'

interface PosterThumbProps {
  src?: string
  label: string
  accent?: string
  className?: string
}

export function PosterThumb({ src, label, accent = '#5b9dff', className }: PosterThumbProps) {
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    setFailed(!src)
  }, [src])

  const initial = label.trim().charAt(0).toUpperCase() || '?'

  if (failed || !src) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] font-display text-sm font-semibold',
          className,
        )}
        style={{
          color: accent,
          background: `linear-gradient(145deg, ${withAlpha(accent, '26')}, ${withAlpha(accent, '0c')})`,
        }}
        aria-hidden
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className={cn(
        'shrink-0 rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-muted)] object-cover',
        className,
      )}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
