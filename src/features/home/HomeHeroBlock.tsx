import { useEffect, useMemo, useState } from 'react'

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
    }, 6000)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const backdrop = slides[index]

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-hairline)] shadow-[var(--elevation-md)]">
      {backdrop ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-700"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(91,157,255,0.18),transparent_55%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/75 to-[var(--color-background)]/20" />
      <div className="relative px-5 py-7 sm:px-6 sm:py-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
          Dashboard
        </p>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight lg:text-3xl">
          {name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-muted-foreground)]">
          {tagline?.trim() ||
            (isDemo
              ? 'Demo desk · add a service in Settings to go live'
              : 'Live companion for your configured services')}
        </p>
      </div>
    </div>
  )
}
