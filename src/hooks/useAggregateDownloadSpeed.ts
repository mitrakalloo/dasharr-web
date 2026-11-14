import { useMemo } from 'react'

import { DEMO_QUEUE } from '@/data/demoDashboard'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useLiveSpeed } from '@/hooks/useLiveSpeed'
import { parseSpeedMBps } from '@/lib/parseSpeed'

export function useAggregateDownloadSpeed(): number {
  const { isDemo } = useConfiguredStack()
  const queue = useDownloadQueue(!isDemo)

  const base = useMemo(() => {
    const items = isDemo ? DEMO_QUEUE : queue.items
    return items
      .filter((item) => item.status === 'downloading')
      .reduce((sum, item) => sum + (parseSpeedMBps(item.speed) ?? 0), 0)
  }, [isDemo, queue.items])

  return useLiveSpeed(base > 0 ? base : null, base > 0) ?? 0
}
