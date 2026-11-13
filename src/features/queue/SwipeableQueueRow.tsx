import { animate, motion, type PanInfo, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { Pause, Play, Trash2 } from 'lucide-react'

import { spring } from '@/lib/motion'

interface SwipeableQueueRowProps {
  children: React.ReactNode
  paused?: boolean
  onPauseToggle?: () => void
  onRemove?: () => void
}

const THRESHOLD = 64
const OPEN = 80

export function SwipeableQueueRow({
  children,
  paused = false,
  onPauseToggle,
  onRemove,
}: SwipeableQueueRowProps) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const leftOpacity = useTransform(x, [0, 16, OPEN], [0, 0.7, 1])
  const rightOpacity = useTransform(x, [0, -16, -OPEN], [0, 0.7, 1])
  const leftEvents = useTransform(x, (value) => (value > 8 ? 'auto' : 'none'))
  const rightEvents = useTransform(x, (value) => (value < -8 ? 'auto' : 'none'))

  function snapTo(target: number) {
    void animate(x, target, spring)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const projected = x.get() + info.velocity.x * 0.12
    if (projected > THRESHOLD) snapTo(OPEN)
    else if (projected < -THRESHOLD) snapTo(-OPEN)
    else snapTo(0)
  }

  if (reduced) return <>{children}</>

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div
        style={{ opacity: leftOpacity, pointerEvents: leftEvents }}
        className="absolute inset-y-0 left-0 flex w-20 flex-col items-center justify-center gap-1 bg-sky-500/25"
        aria-hidden
      >
        <button
          type="button"
          className="flex size-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 text-sky-300 active:scale-95"
          onClick={() => {
            onPauseToggle?.()
            snapTo(0)
          }}
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          <span className="text-[10px] font-medium">{paused ? 'Resume' : 'Pause'}</span>
        </button>
      </motion.div>

      <motion.div
        style={{ opacity: rightOpacity, pointerEvents: rightEvents }}
        className="absolute inset-y-0 right-0 flex w-20 flex-col items-center justify-center gap-1 bg-rose-500/25"
        aria-hidden
      >
        <button
          type="button"
          className="flex size-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 text-rose-300 active:scale-95"
          onClick={() => {
            onRemove?.()
            snapTo(0)
          }}
        >
          <Trash2 className="size-4" />
          <span className="text-[10px] font-medium">Delete</span>
        </button>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -OPEN, right: OPEN }}
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
