import { useEffect, useState } from 'react'

import { listSeerrIssues, type SeerrIssueItem } from '@/lib/services/seerr.issues'
import { useConfigStore } from '@/stores/configStore'

type IssuesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SeerrIssueItem[] }
  | { status: 'error'; error: string }

export function useSeerrIssues(enabled: boolean) {
  const settings = useConfigStore((state) => state.settings)
  const seerr = useConfigStore((state) =>
    state.services.find((service) => service.type === 'seerr' && service.enabled),
  )
  const [state, setState] = useState<IssuesState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled || !seerr) {
      setState({ status: 'idle' })
      return
    }
    let cancelled = false
    async function run() {
      setState({ status: 'loading' })
      try {
        const data = await listSeerrIssues(settings, seerr!)
        if (!cancelled) setState({ status: 'success', data })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Issues failed',
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
    items: state.status === 'success' ? state.data : [],
  }
}
