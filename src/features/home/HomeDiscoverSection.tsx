import { toast } from 'sonner'

import { DiscoverShelves } from '@/features/search/DiscoverShelves'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDiscoverShelves } from '@/hooks/useDiscoverShelves'
import { useMediaSearch } from '@/hooks/useMediaSearch'
import type { DiscoverCard } from '@/lib/services/seerr.discover'

export function HomeDiscoverSection() {
  const { isDemo, has } = useConfiguredStack()
  const discover = useDiscoverShelves(!isDemo && has('seerr'))
  const search = useMediaSearch(!isDemo && has('seerr'), '')

  if (isDemo || !has('seerr')) return null

  function onSelect(item: DiscoverCard) {
    void search
      .beginAdd({
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
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Couldn’t add title')
      })
  }

  return (
    <DiscoverShelves
      shelves={discover.shelves}
      status={discover.status === 'idle' ? 'loading' : discover.status}
      error={discover.status === 'error' ? discover.error : undefined}
      onSelect={onSelect}
    />
  )
}
