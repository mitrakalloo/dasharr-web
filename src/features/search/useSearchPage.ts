import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { DEMO_SEARCH } from '@/data/demoDashboard'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDiscoverShelves } from '@/hooks/useDiscoverShelves'
import {
  useMediaSearch,
  type MediaSearchItem,
  type SearchServiceFilter,
} from '@/hooks/useMediaSearch'
import type { DiscoverCard } from '@/lib/services/seerr.discover'
import type { ServiceType } from '@/types/config'

export const SEARCH_SCOPES = ['All', 'Series', 'Movies', 'Music', 'Books'] as const
export type SearchScope = (typeof SEARCH_SCOPES)[number]

export function useSearchPage() {
  const { isDemo, has, hydrated, needsSetup } = useConfiguredStack()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const setQuery = (next: string) => {
    const nextParams = new URLSearchParams(params)
    if (next) nextParams.set('q', next)
    else nextParams.delete('q')
    setParams(nextParams, { replace: true })
  }
  const [scope, setScope] = useState<SearchScope>('All')
  const [serviceFilter, setServiceFilter] = useState<SearchServiceFilter>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const live = useMediaSearch(!isDemo, query, serviceFilter)
  const discover = useDiscoverShelves(!isDemo && has('seerr') && !query.trim())
  const showDiscover = !isDemo && has('seerr') && !query.trim()

  const demoItems: MediaSearchItem[] = DEMO_SEARCH.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.trim().toLowerCase())
    if (!matchesQuery) return false
    if (scope === 'All') return true
    if (scope === 'Series') return item.type === 'series'
    if (scope === 'Movies') return item.type === 'movie'
    return false
  }).map((item) => ({
    id: item.id,
    titleId: item.titleId,
    title: item.title,
    year: item.year,
    type: item.type as 'series' | 'movie',
    rating: item.rating,
    poster: '',
    overview: '',
    source: 'library' as const,
    alreadyAdded: true,
  }))

  const liveItems = live.items.filter((item) => {
    if (scope === 'All') return true
    if (scope === 'Series') return item.type === 'series'
    if (scope === 'Movies') return item.type === 'movie'
    if (scope === 'Music') return item.type === 'album'
    if (scope === 'Books') return item.type === 'book'
    return true
  })

  function handleDiscoverSelect(item: DiscoverCard) {
    const mapped: MediaSearchItem = {
      id: item.id,
      title: item.title,
      year: item.year ?? 0,
      type: item.type === 'tv' ? 'series' : 'movie',
      rating: item.rating ?? 0,
      poster: item.poster,
      overview: '',
      source: 'seerr',
      alreadyAdded: false,
      tmdbId: item.tmdbId,
    }
    void live.beginAdd(mapped).catch((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Couldn’t add title')
    })
  }

  const serviceChips: Array<{ id: SearchServiceFilter; label: string }> = [
    { id: 'all', label: 'All services' },
    ...live.searchableServices.map((service) => ({
      id: service.type as ServiceType,
      label: service.name || service.type,
    })),
  ]

  return {
    isDemo,
    needsSetup,
    has,
    hydrated,
    query,
    setQuery,
    scope,
    setScope,
    serviceFilter,
    setServiceFilter,
    serviceChips,
    sheetOpen,
    setSheetOpen,
    live,
    discover,
    showDiscover,
    demoItems,
    liveItems,
    handleDiscoverSelect,
  }
}
