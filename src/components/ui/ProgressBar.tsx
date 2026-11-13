import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  color?: string
  className?: string
  /** Breathing glow + diagonal shimmer for active downloads */
  live?: boolean
  animated?: boolean
}

export function ProgressBar({
  value,
  color = 'var(--color-accent)',
  className,
  live = false,
  animated = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/10', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full',
          live && 'progress-live',
          animated && 'transition-[width] duration-700 ease-[var(--ease-out-expo)]',
          !animated && !live && 'transition-[width] duration-300',
        )}
        style={{
          width: `${clamped}%`,
          backgroundColor: color,
          color,
        }}
      />
    </div>
  )
}
