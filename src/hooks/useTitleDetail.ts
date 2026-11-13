import { useEffect, useState } from 'react'

import {
  mapLidarrTitle,
  mapRadarrTitle,
  mapSonarrTitle,
} from '@/features/title/title.mappers'
import { getDemoTitle, type DemoTitle } from '@/data/demoTitles'
import { parseLiveTitleId } from '@/lib/liveTitleId'
import { getLidarrAlbum } from '@/lib/services/lidarr'
import { getRadarrMovieById } from '@/lib/services/radarr'
import { getSonarrEpisodes, getSonarrSeriesById } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

type TitleState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DemoTitle }
  | { status: 'error'; error: string }

export function useTitleDetail(id: string, preferDemo: boolean): TitleState {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const [state, setState] = useState<TitleState>({ status: 'idle' })

  useEffect(() => {
    if (!id) {
      setState({ status: 'error', error: 'Missing title id' })
      return
    }

    if (preferDemo) {
      const demo = getDemoTitle(id)
      setState(
        demo
          ? { status: 'success', data: demo }
          : { status: 'error', error: 'Demo title not found' },
      )
      return
    }

    const demo = getDemoTitle(id)
    const parsed = parseLiveTitleId(id)

    if (!parsed) {
      setState(
        demo
          ? { status: 'success', data: demo }
          : { status: 'error', error: 'Title not found' },
      )
      return
    }

    const service = services.find(
      (entry) => entry.enabled && entry.type === parsed.service,
    )
    if (!service) {
      setState({ status: 'error', error: `${parsed.service} is not configured` })
      return
    }

    let cancelled = false

    async function run() {
      setState({ status: 'loading' })
      try {
        let data: DemoTitle
        if (parsed!.service === 'sonarr') {
          const [series, episodes] = await Promise.all([
            getSonarrSeriesById(settings, service!, parsed!.numericId),
            getSonarrEpisodes(settings, service!, parsed!.numericId),
          ])
          data = mapSonarrTitle(series, episodes, service!.baseUrl)
        } else if (parsed!.service === 'radarr') {
          const movie = await getRadarrMovieById(settings, service!, parsed!.numericId)
          data = mapRadarrTitle(movie, service!.baseUrl)
        } else {
          const album = await getLidarrAlbum(settings, service!, parsed!.numericId)
          data = mapLidarrTitle(album, service!.baseUrl)
        }
        if (!cancelled) setState({ status: 'success', data })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to load title',
          })
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [id, preferDemo, services, settings])

  return state
}
