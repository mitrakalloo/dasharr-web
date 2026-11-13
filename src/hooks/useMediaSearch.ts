import { useEffect, useMemo, useState } from 'react'

import { addMediaSearchItem } from '@/features/search/search.actions'
import {
  mapLibraryMovie,
  mapLibrarySeries,
  mapRadarrLookup,
  mapSeerrResult,
  mapSonarrLookup,
} from '@/features/search/search.mappers'
import { getRadarrMovies, lookupRadarrMovies } from '@/lib/services/radarr'
import { searchSeerr } from '@/lib/services/seerr'
import { getSonarrSeries, lookupSonarrSeries } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

export type MediaSearchItem = {
  id: string
  titleId?: string
  title: string
  year: number
  type: 'series' | 'movie'
  rating: number
  poster: string
  overview: string
  source: 'seerr' | 'sonarr' | 'radarr' | 'library'
  tmdbId?: number
  alreadyAdded?: boolean
  raw?: unknown
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: MediaSearchItem[] }
  | { status: 'error'; error: string }

export function useMediaSearch(enabled: boolean, query: string) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const seerr = services.find((service) => service.type === 'seerr' && service.enabled)
  const sonarr = services.find((service) => service.type === 'sonarr' && service.enabled)
  const radarr = services.find((service) => service.type === 'radarr' && service.enabled)
  const [state, setState] = useState<SearchState>({ status: 'idle' })
  const trimmed = query.trim()
  const canSearch = Boolean(seerr || sonarr || radarr)

  useEffect(() => {
    if (!enabled || !canSearch) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false

    async function run() {
      setState({ status: 'loading' })
      try {
        if (!trimmed) {
          const library: MediaSearchItem[] = []
          if (sonarr) {
            const series = await getSonarrSeries(settings, sonarr)
            library.push(...series.slice(0, 40).map((item) => mapLibrarySeries(item, sonarr.baseUrl)))
          }
          if (radarr) {
            const movies = await getRadarrMovies(settings, radarr)
            library.push(...movies.slice(0, 40).map((item) => mapLibraryMovie(item, radarr.baseUrl)))
          }
          if (!cancelled) setState({ status: 'success', data: library })
          return
        }

        if (seerr) {
          const results = await searchSeerr(settings, seerr, trimmed)
          if (!cancelled) setState({ status: 'success', data: results.map(mapSeerrResult) })
          return
        }

        const results: MediaSearchItem[] = []
        if (sonarr) {
          const series = await lookupSonarrSeries(settings, sonarr, trimmed)
          results.push(...series.slice(0, 20).map((item) => mapSonarrLookup(item, sonarr.baseUrl)))
        }
        if (radarr) {
          const movies = await lookupRadarrMovies(settings, radarr, trimmed)
          results.push(...movies.slice(0, 20).map((item) => mapRadarrLookup(item, radarr.baseUrl)))
        }
        if (!cancelled) setState({ status: 'success', data: results })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Search failed',
          })
        }
      }
    }

    const timer = window.setTimeout(() => void run(), trimmed ? 280 : 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [enabled, canSearch, trimmed, seerr, sonarr, radarr, settings])

  const addItem = useMemo(
    () => (item: MediaSearchItem) =>
      addMediaSearchItem(item, { settings, seerr, sonarr, radarr }),
    [settings, seerr, sonarr, radarr],
  )

  return { ...state, canSearch, addItem, items: state.status === 'success' ? state.data : [] }
}
