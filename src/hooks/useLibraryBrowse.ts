import { useMemo } from 'react'

import { liveTitleId } from '@/lib/liveTitleId'
import { getLidarrAlbums, lidarrCoverUrl } from '@/lib/services/lidarr'
import { getRadarrMovies, radarrPosterUrl } from '@/lib/services/radarr'
import { getSonarrSeries, sonarrPosterUrl } from '@/lib/services/sonarr'
import { usePolling } from '@/hooks/usePolling'
import { useConfigStore } from '@/stores/configStore'

export interface LibraryItem {
  id: string
  titleId: string
  title: string
  year?: number
  subtitle: string
  poster: string
  service: 'sonarr' | 'radarr' | 'lidarr'
}

export function useLibraryBrowse(enabled: boolean) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const sources = useMemo(
    () =>
      services.filter(
        (service) =>
          service.enabled &&
          (service.type === 'sonarr' || service.type === 'radarr' || service.type === 'lidarr'),
      ),
    [services],
  )

  const key = sources.map((service) => service.id).join(',')
  const state = usePolling(
    key,
    async () => {
      const settled = await Promise.allSettled(
        sources.map(async (service) => {
          if (service.type === 'sonarr') {
            const series = await getSonarrSeries(settings, service)
            return series
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title))
              .slice(0, 120)
              .map(
                (item): LibraryItem => ({
                  id: `lib-sonarr-${item.id}`,
                  titleId: liveTitleId('sonarr', item.id),
                  title: item.title,
                  year: item.year,
                  subtitle: 'Series',
                  poster: sonarrPosterUrl(item, service.baseUrl) ?? '',
                  service: 'sonarr',
                }),
              )
          }
          if (service.type === 'radarr') {
            const movies = await getRadarrMovies(settings, service)
            return movies
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title))
              .slice(0, 120)
              .map(
                (item): LibraryItem => ({
                  id: `lib-radarr-${item.id}`,
                  titleId: liveTitleId('radarr', item.id),
                  title: item.title,
                  year: item.year,
                  subtitle: 'Movie',
                  poster: radarrPosterUrl(item, service.baseUrl) ?? '',
                  service: 'radarr',
                }),
              )
          }
          const albums = await getLidarrAlbums(settings, service)
          return albums
            .slice()
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, 120)
            .map(
              (item): LibraryItem => ({
                id: `lib-lidarr-${item.id}`,
                titleId: liveTitleId('lidarr', item.id),
                title: `${item.artist?.artistName ?? 'Artist'} · ${item.title}`,
                year: item.releaseDate ? Number(item.releaseDate.slice(0, 4)) : undefined,
                subtitle: 'Album',
                poster:
                  lidarrCoverUrl(item, service.baseUrl) ??
                  (item.artist ? lidarrCoverUrl(item.artist, service.baseUrl) : undefined) ??
                  '',
                service: 'lidarr',
              }),
            )
        }),
      )
      return settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    60_000,
    enabled && sources.length > 0,
  )

  return {
    ...state,
    items: state.status === 'success' ? state.data : [],
    hasSources: sources.length > 0,
  }
}
