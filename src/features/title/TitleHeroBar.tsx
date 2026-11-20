import { motion, useTransform, type MotionValue } from 'motion/react'
import { ArrowLeft, Bell, BellOff } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'

interface TitleHeroBarProps {
  title: string
  monitored: boolean
  scrollY: MotionValue<number>
  onBack: () => void
  onToggleMonitor: () => void
}

export function TitleHeroBar({
  title,
  monitored,
  scrollY,
  onBack,
  onToggleMonitor,
}: TitleHeroBarProps) {
  const backdropOpacity = useTransform(scrollY, [0, 32], [0, 1])
  const titleOpacity = useTransform(scrollY, [72, 130], [0, 1])
  const titleY = useTransform(scrollY, [72, 130], [6, 0])

  return (
    <div className="sticky top-0 z-30 pt-[max(8px,env(safe-area-inset-top))]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border-b border-[var(--color-hairline)] bg-[var(--color-surface-header)] backdrop-blur-xl"
        style={{ opacity: backdropOpacity }}
      />
      <div className="relative mx-auto flex h-12 max-w-[var(--content-max)] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </IconButton>

        <motion.p
          className="min-w-0 flex-1 truncate text-center font-display text-sm font-semibold tracking-tight text-[var(--color-foreground)]"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          {title}
        </motion.p>

        <IconButton
          label={monitored ? 'Unmonitor' : 'Monitor'}
          tone={monitored ? 'primary' : 'default'}
          onClick={onToggleMonitor}
        >
          {monitored ? <Bell className="size-5" /> : <BellOff className="size-5" />}
        </IconButton>
      </div>
    </div>
  )
}
