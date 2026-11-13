import { motion, useTransform, type MotionValue } from 'motion/react'

import { PosterThumb } from '@/components/ui/PosterThumb'
import type { DemoTitle } from '@/data/demoTitles'
import { serviceAccent } from '@/lib/serviceColors'

interface TitleHeroProps {
  title: DemoTitle
  scrollY: MotionValue<number>
}

export function TitleHero({ title, scrollY }: TitleHeroProps) {
  const accent = serviceAccent(title.service)

  // Backdrop moves at ~0.4× scroll speed and softens as content covers it
  const backdropY = useTransform(scrollY, [0, 280], [0, 112])
  const backdropScale = useTransform(scrollY, [0, 280], [1.08, 1.2])
  const backdropBlur = useTransform(scrollY, [0, 200], [0, 14])
  const backdropOpacity = useTransform(scrollY, [0, 220], [0.55, 0.18])
  const backdropFilter = useTransform(backdropBlur, (value) => `blur(${value}px)`)
  const posterY = useTransform(scrollY, [0, 200], [0, 36])
  const posterOpacity = useTransform(scrollY, [0, 160], [1, 0.35])

  return (
    <div className="relative -mt-14 overflow-hidden border-b border-[var(--color-border)]">
      <motion.div
        aria-hidden
        className="absolute inset-0 origin-top will-change-transform"
        style={{
          y: backdropY,
          scale: backdropScale,
          opacity: backdropOpacity,
          filter: backdropFilter,
          background: `radial-gradient(ellipse 90% 70% at 30% 0%, ${accent}66, transparent 58%), linear-gradient(180deg, #1a1a1f 0%, #09090b 100%)`,
        }}
      />

      <div className="relative px-4 pb-5 pt-[calc(56px+max(12px,env(safe-area-inset-top)))]">
        <div className="flex gap-4">
          <motion.div style={{ y: posterY, opacity: posterOpacity }}>
            <PosterThumb
              src={title.poster}
              label={title.title}
              accent={accent}
              className="h-40 w-[106px] rounded-xl"
            />
          </motion.div>
          <div className="min-w-0 flex-1 self-end">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accent }}>
              {title.service} · {title.kind}
            </p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight">
              {title.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              {title.year} · {title.runtime} · ★ {title.rating.toFixed(1)}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {title.genres.join(' · ')}
              {title.network ? ` · ${title.network}` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
