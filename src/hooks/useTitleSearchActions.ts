import { useCallback } from 'react'
import { toast } from 'sonner'

import { parseLiveTitleId } from '@/lib/liveTitleId'
import {
  commandRadarrMoviesSearch,
  grabRadarrRelease,
  searchRadarrMovieReleases,
} from '@/lib/services/radarr'
import {
  commandSonarrEpisodeSearch,
  commandSonarrSeasonSearch,
  grabSonarrRelease,
  searchSonarrEpisodeReleases,
  type ArrRelease,
} from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

export function useTitleSearchActions(titleId: string) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const parsed = parseLiveTitleId(titleId)
  const service = parsed
    ? services.find((entry) => entry.enabled && entry.type === parsed.service)
    : undefined

  const searchEpisodeReleases = useCallback(
    async (episodeId: number): Promise<ArrRelease[]> => {
      if (!parsed || parsed.service !== 'sonarr' || !service) {
        throw new Error('Sonarr is required for episode search')
      }
      return searchSonarrEpisodeReleases(settings, service, episodeId)
    },
    [parsed, service, settings],
  )

  const searchMovieReleases = useCallback(async (): Promise<ArrRelease[]> => {
    if (!parsed || parsed.service !== 'radarr' || !service) {
      throw new Error('Radarr is required for movie search')
    }
    return searchRadarrMovieReleases(settings, service, parsed.numericId)
  }, [parsed, service, settings])

  const grabRelease = useCallback(
    async (release: ArrRelease) => {
      if (!parsed || !service) throw new Error('No *arr service configured')
      if (parsed.service === 'sonarr') {
        await grabSonarrRelease(settings, service, release)
      } else if (parsed.service === 'radarr') {
        await grabRadarrRelease(settings, service, release)
      } else {
        throw new Error('Grab isn’t supported for this service yet')
      }
      toast.success('Release grabbed')
    },
    [parsed, service, settings],
  )

  const autoSearchEpisodes = useCallback(
    async (episodeIds: number[]) => {
      if (!parsed || parsed.service !== 'sonarr' || !service) {
        throw new Error('Sonarr is required')
      }
      await commandSonarrEpisodeSearch(settings, service, episodeIds)
      toast.success('Automatic episode search queued')
    },
    [parsed, service, settings],
  )

  const autoSearchSeason = useCallback(
    async (seasonNumber: number) => {
      if (!parsed || parsed.service !== 'sonarr' || !service) {
        throw new Error('Sonarr is required')
      }
      await commandSonarrSeasonSearch(settings, service, parsed.numericId, seasonNumber)
      toast.success(`Season ${seasonNumber} auto-search queued`)
    },
    [parsed, service, settings],
  )

  const autoSearchMovie = useCallback(async () => {
    if (!parsed || parsed.service !== 'radarr' || !service) {
      throw new Error('Radarr is required')
    }
    await commandRadarrMoviesSearch(settings, service, [parsed.numericId])
    toast.success('Automatic movie search queued')
  }, [parsed, service, settings])

  return {
    parsed,
    canSearch: Boolean(service && parsed && parsed.service !== 'lidarr'),
    searchEpisodeReleases,
    searchMovieReleases,
    grabRelease,
    autoSearchEpisodes,
    autoSearchSeason,
    autoSearchMovie,
  }
}
