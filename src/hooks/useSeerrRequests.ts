import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { DemoSeerrRequest } from '@/data/demoDashboard'
import {
  approveSeerrRequest,
  declineSeerrRequest,
  getSeerrMovie,
  getSeerrRequests,
  getSeerrTv,
  seerrStatusLabel,
} from '@/lib/services/seerr'
import { useConfigStore } from '@/stores/configStore'

type RequestsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DemoSeerrRequest[] }
  | { status: 'error'; error: string }

function mapStatus(status: number): DemoSeerrRequest['status'] {
  if (status === 2) return 'approved'
  if (status === 3) return 'declined'
  return 'pending'
}

function tmdbPoster(path?: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w185${path}`
}

export function useSeerrRequests(enabled: boolean) {
  const settings = useConfigStore((state) => state.settings)
  const seerr = useConfigStore((state) =>
    state.services.find((service) => service.type === 'seerr' && service.enabled),
  )
  const [state, setState] = useState<RequestsState>({ status: 'idle' })
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((value) => value + 1), [])

  useEffect(() => {
    if (!enabled || !seerr) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false

    async function run() {
      setState({ status: 'loading' })
      try {
        const page = await getSeerrRequests(settings, seerr!)
        const data = await Promise.all(
          page.results.map(async (request) => {
            const tmdbId = request.media.tmdbId
            let title = `${request.type === 'tv' ? 'Series' : 'Movie'} #${tmdbId ?? request.id}`
            let overview = `Seerr request ${request.id}`
            let poster = ''
            let year = new Date(request.createdAt).getFullYear()

            if (tmdbId) {
              try {
                const details =
                  request.type === 'tv'
                    ? await getSeerrTv(settings, seerr!, tmdbId)
                    : await getSeerrMovie(settings, seerr!, tmdbId)
                title = details.title ?? details.name ?? title
                overview = details.overview ?? overview
                poster = tmdbPoster(details.posterPath)
                const date = details.releaseDate ?? details.firstAirDate
                if (date) year = Number(date.slice(0, 4)) || year
              } catch {
                // keep placeholders
              }
            }

            const mapped: DemoSeerrRequest = {
              id: String(request.id),
              title,
              year,
              type: request.type === 'tv' ? 'tv' : 'movie',
              status: mapStatus(request.status),
              requestedBy: request.requestedBy?.displayName ?? 'Unknown',
              requestedAt: new Date(request.createdAt).toLocaleDateString(),
              quality: seerrStatusLabel(request.status),
              poster,
              overview,
            }
            return mapped
          }),
        )

        if (!cancelled) setState({ status: 'success', data })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to load requests',
          })
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [enabled, seerr, settings, tick])

  const approve = useCallback(
    async (id: string) => {
      if (!seerr) return
      await approveSeerrRequest(settings, seerr, Number(id))
      toast.success('Request approved')
      refresh()
    },
    [seerr, settings, refresh],
  )

  const decline = useCallback(
    async (id: string) => {
      if (!seerr) return
      await declineSeerrRequest(settings, seerr, Number(id))
      toast.message('Request declined')
      refresh()
    },
    [seerr, settings, refresh],
  )

  return { ...state, approve, decline, refresh }
}
