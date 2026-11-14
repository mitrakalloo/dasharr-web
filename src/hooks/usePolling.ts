import { useEffect, useRef, useState } from 'react'

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; updatedAt: number }
  | { status: 'error'; error: string }

export function usePolling<T>(
  key: string,
  fetcher: () => Promise<T>,
  intervalMs = 5000,
  enabled = true,
) {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false
    let timer: number | undefined

    async function load(isInitial: boolean) {
      if (isInitial) setState({ status: 'loading' })
      try {
        const data = await fetcherRef.current()
        if (!cancelled) setState({ status: 'success', data, updatedAt: Date.now() })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed'
        if (!cancelled) setState({ status: 'error', error: message })
      }
    }

    void load(true)
    timer = window.setInterval(() => {
      void load(false)
    }, intervalMs)

    return () => {
      cancelled = true
      if (timer) window.clearInterval(timer)
    }
  }, [key, intervalMs, enabled])

  return state
}
