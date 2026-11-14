import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AddOptions, AddOptionsBundle } from '@/features/search/addOptions.types'
import { fetchAddOptionsBundle } from '@/features/search/fetchAddOptions'
import { addMediaSearchItem } from '@/features/search/search.actions'
import {
  mapLidarrLookup,
  mapLibraryMovie,
  mapLibrarySeries,
  mapRadarrLookup,
  mapReadarrLookup,
  mapSeerrResult,
  mapSonarrLookup,
  mapWhisparrLookup,
} from '@/features/search/search.mappers'
import { lookupLidarrAlbums } from '@/lib/services/lidarr'
import { getRadarrMovies, lookupRadarrMovies } from '@/lib/services/radarr'
import { lookupReadarrBooks } from '@/lib/services/readarr'
import { searchSeerr } from '@/lib/services/seerr'
import { getSonarrSeries, lookupSonarrSeries } from '@/lib/services/sonarr'
import { lookupWhisparrMovies } from '@/lib/services/whisparr'
import { useConfigStore } from '@/stores/configStore'
import { usePrefsStore } from '@/stores/prefsStore'
import type { ServiceType } from '@/types/config'

export type MediaSearchItem = {
  id: string
  titleId?: string
  title: string
  year: number
  type: 'series' | 'movie' | 'album' | 'book'
  rating: number
  poster: string
  overview: string
  source: 'seerr' | 'sonarr' | 'radarr' | 'lidarr' | 'readarr' | 'whisparr' | 'library'
  tmdbId?: number
  alreadyAdded?: boolean
  raw?: unknown
}

export type SearchServiceFilter = 'all' | ServiceType

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: MediaSearchItem[] }
  | { status: 'error'; error: string }

const SEARCHABLE: ServiceType[] = [
  'seerr',
  'sonarr',
  'radarr',
  'lidarr',
  'readarr',
  'whisparr',
]

export function useMediaSearch(
  enabled: boolean,
  query: string,
  serviceFilter: SearchServiceFilter = 'all',
) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const defaultAdd = usePrefsStore((state) => state.defaultAdd)
  const enabledServices = useMemo(
    () => services.filter((service) => service.enabled && SEARCHABLE.includes(service.type)),
    [services],
  )
  const seerr = enabledServices.find((service) => service.type === 'seerr')
  const sonarr = enabledServices.find((service) => service.type === 'sonarr')
  const radarr = enabledServices.find((service) => service.type === 'radarr')
  const lidarr = enabledServices.find((service) => service.type === 'lidarr')
  const readarr = enabledServices.find((service) => service.type === 'readarr')
  const whisparr = enabledServices.find((service) => service.type === 'whisparr')

  const [state, setState] = useState<SearchState>({ status: 'idle' })
  const [pendingItem, setPendingItem] = useState<MediaSearchItem | null>(null)
  const [bundle, setBundle] = useState<AddOptionsBundle | null>(null)
  const trimmed = query.trim()
  const canSearch = enabledServices.length > 0

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
          if (sonarr && (serviceFilter === 'all' || serviceFilter === 'sonarr')) {
            const series = await getSonarrSeries(settings, sonarr)
            library.push(
              ...series.slice(0, 40).map((item) => mapLibrarySeries(item, sonarr.baseUrl)),
            )
          }
          if (radarr && (serviceFilter === 'all' || serviceFilter === 'radarr')) {
            const movies = await getRadarrMovies(settings, radarr)
            library.push(
              ...movies.slice(0, 40).map((item) => mapLibraryMovie(item, radarr.baseUrl)),
            )
          }
          if (!cancelled) setState({ status: 'success', data: library })
          return
        }

        const results: MediaSearchItem[] = []
        const want = (type: ServiceType) =>
          serviceFilter === 'all' || serviceFilter === type

        if (seerr && want('seerr')) {
          const rows = await searchSeerr(settings, seerr, trimmed)
          results.push(...rows.map(mapSeerrResult))
        } else {
          const tasks: Array<Promise<void>> = []
          if (sonarr && want('sonarr')) {
            tasks.push(
              lookupSonarrSeries(settings, sonarr, trimmed).then((rows) => {
                results.push(
                  ...rows.slice(0, 20).map((item) => mapSonarrLookup(item, sonarr.baseUrl)),
                )
              }),
            )
          }
          if (radarr && want('radarr')) {
            tasks.push(
              lookupRadarrMovies(settings, radarr, trimmed).then((rows) => {
                results.push(
                  ...rows.slice(0, 20).map((item) => mapRadarrLookup(item, radarr.baseUrl)),
                )
              }),
            )
          }
          if (lidarr && want('lidarr')) {
            tasks.push(
              lookupLidarrAlbums(settings, lidarr, trimmed).then((rows) => {
                results.push(
                  ...rows.slice(0, 20).map((item) => mapLidarrLookup(item, lidarr.baseUrl)),
                )
              }),
            )
          }
          if (readarr && want('readarr')) {
            tasks.push(
              lookupReadarrBooks(settings, readarr, trimmed).then((rows) => {
                results.push(...rows.slice(0, 20).map(mapReadarrLookup))
              }),
            )
          }
          if (whisparr && want('whisparr')) {
            tasks.push(
              lookupWhisparrMovies(settings, whisparr, trimmed).then((rows) => {
                results.push(
                  ...rows
                    .slice(0, 20)
                    .map((item) => mapWhisparrLookup(item, whisparr.baseUrl)),
                )
              }),
            )
          }
          await Promise.all(tasks)
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
  }, [
    enabled,
    canSearch,
    trimmed,
    serviceFilter,
    seerr,
    sonarr,
    radarr,
    lidarr,
    readarr,
    whisparr,
    settings,
  ])

  const beginAdd = useCallback(
    async (item: MediaSearchItem) => {
      const service =
        item.source === 'seerr'
          ? seerr
          : item.source === 'sonarr'
            ? sonarr
            : item.source === 'radarr'
              ? radarr
              : item.source === 'lidarr'
                ? lidarr
                : item.source === 'readarr'
                  ? readarr
                  : item.source === 'whisparr'
                    ? whisparr
                    : undefined
      if (!service) return
      setPendingItem(item)
      setBundle(null)
      const mediaType =
        item.type === 'series' ? 'tv' : item.type === 'album' ? 'album' : item.type === 'book' ? 'book' : 'movie'
      const next = await fetchAddOptionsBundle(settings, service, mediaType)
      setBundle(next)
    },
    [settings, seerr, sonarr, radarr, lidarr, readarr, whisparr],
  )

  const confirmAdd = useCallback(
    async (options: AddOptions) => {
      if (!pendingItem) return
      await addMediaSearchItem(
        pendingItem,
        { settings, seerr, sonarr, radarr, lidarr, readarr, whisparr },
        options,
      )
      setPendingItem(null)
      setBundle(null)
    },
    [pendingItem, settings, seerr, sonarr, radarr, lidarr, readarr, whisparr],
  )

  return {
    ...state,
    canSearch,
    items: state.status === 'success' ? state.data : [],
    searchableServices: enabledServices,
    beginAdd,
    confirmAdd,
    cancelAdd: () => {
      setPendingItem(null)
      setBundle(null)
    },
    pendingItem,
    addBundle: bundle,
    defaultAdd,
    /** @deprecated prefer beginAdd */
    addItem: beginAdd,
  }
}
