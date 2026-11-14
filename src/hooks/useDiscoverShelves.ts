import { useEffect, useState } from 'react'

import {
  getSeerrDiscoverShelves,
  type DiscoverShelf,
} from '@/lib/services/seerr.discover'
import { useConfigStore } from '@/stores/configStore'

type DiscoverState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DiscoverShelf[] }
  | { status: 'error'; error: string }

export function useDiscoverShelves(enabled: boolean) {
  const settings = useConfigStore((state) => state.settings)
  const seerr = useConfigStore((state) =>
    state.services.find((service) => service.type === 'seerr' && service.enabled),
  )
  const [state, setState] = useState<DiscoverState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled || !seerr) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false

    async function run() {
      setState({ status: 'loading' })
      try {
        const data = await getSeerrDiscoverShelves(settings, seerr!)
        if (!cancelled) setState({ status: 'success', data })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Discover failed',
          })
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [enabled, seerr, settings])

  return {
    ...state,
    shelves: state.status === 'success' ? state.data : [],
    hasSeerr: Boolean(seerr),
  }
}
