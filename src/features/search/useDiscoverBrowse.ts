import { useEffect, useMemo, useState } from 'react'

import {
  DISCOVER_CATEGORIES,
  providerCategory,
  tmdbPoster,
} from '@/features/search/discoverBrowse.constants'
import { serviceJson } from '@/lib/http/client'
import type { DiscoverCard } from '@/lib/services/seerr.discover'
import { useConfigStore } from '@/stores/configStore'
import { usePrefsStore } from '@/stores/prefsStore'
import type { ServiceConfig } from '@/types/config'

export function useDiscoverBrowse(
  enabled: boolean,
  seerr: ServiceConfig | undefined,
) {
  const settings = useConfigStore((state) => state.settings)
  const watchRegion = usePrefsStore((state) => state.experience.watchRegion)
  const categories = useMemo(
    () => [...DISCOVER_CATEGORIES, providerCategory(watchRegion)],
    [watchRegion],
  )
  const [categoryId, setCategoryId] = useState(DISCOVER_CATEGORIES[0].id)
  const [items, setItems] = useState<DiscoverCard[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const category = useMemo(
    () => categories.find((entry) => entry.id === categoryId) ?? categories[0],
    [categories, categoryId],
  )

  useEffect(() => {
    if (!enabled || !seerr) return
    let cancelled = false
    async function load() {
      setStatus('loading')
      try {
        const payload = await serviceJson<{ results?: Array<Record<string, unknown>> }>(
          settings,
          seerr!,
          category.path,
        )
        if (cancelled) return
        setItems(
          (payload.results ?? []).slice(0, 48).map((item, index) => {
            const mediaType = String(item.mediaType ?? category.type ?? 'movie')
            const release = String(item.releaseDate ?? item.firstAirDate ?? '')
            return {
              id: `browse-${item.id ?? index}`,
              tmdbId: Number(item.id),
              title: String(item.title ?? item.name ?? `Title ${item.id}`),
              year: release ? Number(release.slice(0, 4)) || undefined : undefined,
              type: mediaType === 'tv' ? 'tv' : 'movie',
              poster: tmdbPoster(
                typeof item.posterPath === 'string' ? item.posterPath : undefined,
              ),
              rating:
                typeof item.voteAverage === 'number' && item.voteAverage > 0
                  ? item.voteAverage
                  : undefined,
            } satisfies DiscoverCard
          }),
        )
        setStatus('success')
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Browse failed')
          setStatus('error')
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [enabled, seerr, settings, category])

  return { categories, categoryId, setCategoryId, items, status, error }
}
