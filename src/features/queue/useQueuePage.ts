import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { mapSeerrRequestItem } from '@/features/queue/queue.mappers'
import { DEMO_QUEUE, type DemoQueueItem } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'
import { useTautulliSessions } from '@/hooks/useTautulliSessions'

export const QUEUE_FILTERS = [
  'all',
  'downloading',
  'paused',
  'queued',
  'requests',
  'watching',
] as const

export type QueueFilter = (typeof QUEUE_FILTERS)[number]

export function useQueuePage() {
  const navigate = useNavigate()
  const { isDemo, hydrated, has } = useConfiguredStack()
  const live = useDownloadQueue(!isDemo)
  const requests = useSeerrRequests(!isDemo && has('seerr'))
  const watching = useTautulliSessions(!isDemo && has('tautulli'))
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [selected, setSelected] = useState<DemoQueueItem | null>(null)

  const requestItems = useMemo(() => {
    if (isDemo || requests.status !== 'success') return []
    return requests.data
      .filter((item) => item.status === 'pending' || item.status === 'approved')
      .map(mapSeerrRequestItem)
  }, [isDemo, requests])

  const source = useMemo(() => {
    if (isDemo) return DEMO_QUEUE
    return [...live.items, ...requestItems, ...watching.items]
  }, [isDemo, live.items, requestItems, watching.items])

  const canShowQueue =
    isDemo || live.hasSources || requestItems.length > 0 || watching.hasSources

  const items = useMemo(() => {
    if (filter === 'all') return source
    if (filter === 'requests') return source.filter((item) => item.status === 'request')
    if (filter === 'watching') return source.filter((item) => item.status === 'watching')
    return source.filter((item) => item.status === filter)
  }, [filter, source])

  const visibleFilters = QUEUE_FILTERS.filter((value) => {
    if (value === 'requests') return isDemo || has('seerr')
    if (value === 'watching') return isDemo || has('tautulli')
    return true
  })

  function openItem(item: DemoQueueItem) {
    if (item.titleId) {
      navigate(titlePath(item.titleId))
      return
    }
    if (item.status === 'request') {
      navigate('/requests')
      return
    }
    setSelected(item)
  }

  function handleRemove(item: DemoQueueItem) {
    if (item.status === 'watching') {
      void watching.terminate(item)
      return
    }
    void live.removeItem(item)
  }

  return {
    isDemo,
    hydrated,
    live,
    filter,
    setFilter,
    selected,
    setSelected,
    source,
    items,
    canShowQueue,
    visibleFilters,
    openItem,
    handleRemove,
  }
}
