import {
  animate,
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import { Pause, Play, RotateCcw, Trash2 } from 'lucide-react'

import { useIsDesktop } from '@/hooks/useMediaQuery'
import { spring } from '@/lib/motion'

interface SwipeableQueueRowProps {
  children: React.ReactNode
  paused?: boolean
  onPauseToggle?: () => void
  onRetry?: () => void
  onRemove?: () => void
}

const THRESHOLD = 72
const OPEN = 96

export function SwipeableQueueRow({
  children,
  paused = false,
  onPauseToggle,
  onRetry,
  onRemove,
}: SwipeableQueueRowProps) {
  const reduced = useReducedMotion()
  const isDesktop = useIsDesktop()
  const x = useMotionValue(0)
  const leftOpacity = useTransform(x, [0, 16, OPEN], [0, 0.7, 1])
  const rightOpacity = useTransform(x, [0, -16, -OPEN], [0, 0.7, 1])
  const leftEvents = useTransform(x, (value) => (value > 8 ? 'auto' : 'none'))
  const rightEvents = useTransform(x, (value) => (value < -8 ? 'auto' : 'none'))
  const leftWidth = onPauseToggle && onRetry ? 128 : 84

  function snapTo(target: number) {
    void animate(x, target, spring)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const projected = x.get() + info.velocity.x * 0.12
    if (projected > THRESHOLD) snapTo(leftWidth)
    else if (projected < -THRESHOLD) snapTo(-OPEN)
    else snapTo(0)
  }

  if (reduced || isDesktop) return <>{children}</>
  if (!onPauseToggle && !onRetry && !onRemove) return <>{children}</>

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-2xl)]">
      {(onPauseToggle || onRetry) && (
        <motion.div
          style={{ opacity: leftOpacity, pointerEvents: leftEvents, width: leftWidth }}
          className="absolute inset-y-0 left-0 flex items-center justify-evenly bg-[var(--color-info-muted)]"
        >
          {onPauseToggle ? (
            <button
              type="button"
              className="flex size-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 text-[var(--color-info)] active:scale-95"
              onClick={() => {
                onPauseToggle()
                snapTo(0)
              }}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              <span className="text-[10px] font-semibold">{paused ? 'Resume' : 'Pause'}</span>
            </button>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              className="flex size-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 text-[var(--color-warning)] active:scale-95"
              onClick={() => {
                onRetry()
                snapTo(0)
              }}
            >
              <RotateCcw className="size-4" />
              <span className="text-[10px] font-semibold">Retry</span>
            </button>
          ) : null}
        </motion.div>
      )}

      {onRemove ? (
        <motion.div
          style={{ opacity: rightOpacity, pointerEvents: rightEvents }}
          className="absolute inset-y-0 right-0 flex w-24 flex-col items-center justify-center gap-1 bg-[var(--color-destructive-muted)]"
        >
          <button
            type="button"
            className="flex size-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 text-[var(--color-destructive)] active:scale-95"
            onClick={() => {
              onRemove()
              snapTo(0)
            }}
          >
            <Trash2 className="size-4" />
            <span className="text-[10px] font-semibold">Delete</span>
          </button>
        </motion.div>
      ) : null}

      <motion.div
        drag="x"
        dragConstraints={{
          left: onRemove ? -OPEN : 0,
          right: onPauseToggle || onRetry ? leftWidth : 0,
        }}
        dragElastic={0.14}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative touch-pan-y will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}
