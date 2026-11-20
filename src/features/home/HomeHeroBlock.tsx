import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, Radio, SlidersHorizontal } from 'lucide-react'

import { useDownloadHistory } from '@/hooks/useDownloadHistory'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDiscoverShelves } from '@/hooks/useDiscoverShelves'
import { useOverviewSections } from '@/features/overview/useOverviewSections'

interface HomeHeroBlockProps {
  name: string
  tagline?: string
  isDemo: boolean
}

export function HomeHeroBlock({ name, tagline, isDemo }: HomeHeroBlockProps) {
  const { has } = useConfiguredStack()
  const overview = useOverviewSections()
  const discover = useDiscoverShelves(!isDemo && has('seerr'))
  const history = useDownloadHistory(!isDemo && (has('sonarr') || has('radarr')))
  const [index, setIndex] = useState(0)

  const slides = useMemo(() => {
    const posters: string[] = []
    for (const shelf of discover.shelves) {
      for (const item of shelf.items) {
        if (item.poster) posters.push(item.poster)
      }
    }
    for (const release of overview.upcoming) {
      if (release.poster) posters.push(release.poster)
    }
    for (const item of history.items) {
      void item
    }
    return [...new Set(posters)].slice(0, 8)
  }, [discover.shelves, overview.upcoming, history.items])

  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % slides.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const backdrop = slides[index]

  return (
    <div className="panel relative overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--panel-highlight),var(--elevation-md)]">
      {backdrop ? (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-25 blur-[2px] transition-all duration-1000"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary-muted),transparent_58%)]" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(125deg, var(--color-card) 15%, color-mix(in srgb, var(--color-card) 82%, transparent) 62%, color-mix(in srgb, var(--color-card) 55%, transparent) 100%)',
        }}
      />

      <div className="relative flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-7">
        <div className="min-w-0 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary-muted)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--color-primary)]">
            <Radio className="size-3" aria-hidden />
            <span>{isDemo ? 'Demo workspace' : 'Live stack'}</span>
          </div>
          <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {name}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            {tagline?.trim() ||
              (isDemo
                ? 'Explore the interactive demo desk, or add your first service in Settings to go live.'
                : 'Real-time telemetry, queue control, and release tracking across your media stack.')}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            to="/search"
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-on-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),var(--elevation-glow)] transition hover:brightness-110 active:scale-[0.97]"
          >
            <Compass className="size-4" aria-hidden />
            <span>Find & request</span>
          </Link>
          <Link
            to={isDemo ? '/settings?focus=services' : '/edit-home'}
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card-elevated)]/90 px-3.5 text-xs font-semibold text-[var(--color-foreground)] backdrop-blur-md transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] active:scale-[0.97]"
          >
            <SlidersHorizontal className="size-3.5" aria-hidden />
            <span>{isDemo ? 'Connect services' : 'Edit widgets'}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
