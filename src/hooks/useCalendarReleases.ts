import { useEffect, useMemo, useState } from 'react'

import {
  calendarDateRange,
  mapLidarrAlbum,
  mapRadarrMovie,
  mapSonarrEpisode,
} from '@/features/calendar/calendar.mappers'
import type { DemoRelease } from '@/data/demoDashboard'
import { getLidarrCalendar } from '@/lib/services/lidarr'
import { getRadarrCalendar } from '@/lib/services/radarr'
import { getSonarrCalendar } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

type CalendarState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DemoRelease[] }
  | { status: 'error'; error: string }

export function useCalendarReleases(enabled: boolean): CalendarState {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)

  const sources = useMemo(
    () =>
      services.filter(
        (service) =>
          service.enabled &&
          (service.type === 'sonarr' ||
            service.type === 'radarr' ||
            service.type === 'lidarr'),
      ),
    [services],
  )

  const [state, setState] = useState<CalendarState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled || sources.length === 0) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false
    const { start, end } = calendarDateRange()

    async function run() {
      setState({ status: 'loading' })
      try {
        const settled = await Promise.allSettled(
          sources.map(async (service) => {
            if (service.type === 'sonarr') {
              const episodes = await getSonarrCalendar(settings, service, start, end)
              return episodes.map((episode) => mapSonarrEpisode(episode, service.baseUrl))
            }
            if (service.type === 'lidarr') {
              const albums = await getLidarrCalendar(settings, service, start, end)
              return albums.map((album) => mapLidarrAlbum(album, service.baseUrl))
            }
            const movies = await getRadarrCalendar(settings, service, start, end)
            return movies.map((movie) => mapRadarrMovie(movie, service.baseUrl))
          }),
        )

        if (cancelled) return

        const data = settled
          .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
          .sort((a, b) => new Date(a.airDate).getTime() - new Date(b.airDate).getTime())

        const failures = settled.filter((result) => result.status === 'rejected')
        if (data.length === 0 && failures.length > 0) {
          const first = failures[0]
          const reason =
            first.status === 'rejected' && first.reason instanceof Error
              ? first.reason.message
              : 'Failed to load calendar'
          setState({ status: 'error', error: reason })
          return
        }

        setState({ status: 'success', data })
      } catch (error) {
        if (cancelled) return
        setState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to load calendar',
        })
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [enabled, sources, settings])

  return state
}
