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
  const barBg = useTransform(
    scrollY,
    [0, 28],
    ['rgba(9, 9, 11, 0)', 'rgba(9, 9, 11, 0.78)'],
  )
  const titleOpacity = useTransform(scrollY, [72, 130], [0, 1])
  const titleY = useTransform(scrollY, [72, 130], [6, 0])
  const borderColor = useTransform(
    scrollY,
    [0, 28],
    ['rgba(39, 39, 42, 0)', 'rgba(39, 39, 42, 0.9)'],
  )

  return (
    <motion.div
      className="sticky top-0 z-30 px-4 pt-[max(8px,env(safe-area-inset-top))] backdrop-blur-xl"
      style={{ backgroundColor: barBg, borderBottomWidth: 1, borderBottomColor: borderColor }}
    >
      <div className="flex h-12 items-center gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </IconButton>

        <motion.p
          className="min-w-0 flex-1 truncate text-center text-sm font-semibold tracking-tight"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          {title}
        </motion.p>

        <IconButton
          label={monitored ? 'Unmonitor' : 'Monitor'}
          tone={monitored ? 'accent' : 'default'}
          onClick={onToggleMonitor}
        >
          {monitored ? <Bell className="size-5" /> : <BellOff className="size-5" />}
        </IconButton>
      </div>
    </motion.div>
  )
}
