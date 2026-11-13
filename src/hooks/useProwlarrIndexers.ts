import { useEffect, useState } from 'react'

import { getProwlarrIndexers, type ProwlarrIndexer } from '@/lib/services/prowlarr'
import { useConfigStore } from '@/stores/configStore'

type IndexerState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ProwlarrIndexer[] }
  | { status: 'error'; error: string }

export function useProwlarrIndexers(enabled: boolean): IndexerState {
  const settings = useConfigStore((state) => state.settings)
  const prowlarr = useConfigStore((state) =>
    state.services.find((service) => service.type === 'prowlarr' && service.enabled),
  )
  const [state, setState] = useState<IndexerState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled || !prowlarr) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false

    async function run() {
      setState({ status: 'loading' })
      try {
        const data = await getProwlarrIndexers(settings, prowlarr!)
        if (!cancelled) setState({ status: 'success', data })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to load indexers',
          })
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [enabled, prowlarr, settings])

  return state
}
