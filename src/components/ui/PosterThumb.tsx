import { useState } from 'react'

import { cn } from '@/lib/cn'

interface PosterThumbProps {
  src?: string
  label: string
  accent?: string
  className?: string
}

export function PosterThumb({ src, label, accent = '#3f3f46', className }: PosterThumbProps) {
  const [failed, setFailed] = useState(!src)
  const initial = label.trim().charAt(0).toUpperCase() || '?'

  if (failed) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white/90',
          className,
        )}
        style={{ backgroundColor: `${accent}55` }}
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
      className={cn('shrink-0 rounded-md object-cover', className)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
