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
      // history may not have posters; skip
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
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)]">
      {backdrop ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 transition-opacity duration-700"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/80 to-transparent" />
      <div className="relative px-4 py-6 sm:px-5 sm:py-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight lg:text-3xl">{name}</h1>
        <p className="mt-1 max-w-xl text-sm text-[var(--color-muted-foreground)]">
          {tagline?.trim() ||
            (isDemo
              ? 'Demo desk · add a service in Settings to go live'
              : 'Live companion for your configured services')}
        </p>
      </div>
    </div>
  )
}
