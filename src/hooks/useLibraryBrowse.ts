import { useMemo } from 'react'

import { usePolling } from '@/hooks/usePolling'
import { liveTitleId } from '@/lib/liveTitleId'
import { getLidarrAlbums, lidarrCoverUrl } from '@/lib/services/lidarr'
import { getRadarrMovies, radarrPosterUrl } from '@/lib/services/radarr'
import { getSonarrSeries, sonarrPosterUrl } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

export interface LibraryItem {
  id: string
  titleId: string
  title: string
  year?: number
  subtitle: string
  poster: string
  service: 'sonarr' | 'radarr' | 'lidarr'
  monitored: boolean
  hasFile: boolean
  sizeOnDisk: number
  added?: string
  rating?: number
  status?: string
  episodeFileCount?: number
  episodeCount?: number
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
              .slice(0, 1000)
              .map((item): LibraryItem => {
                const fileCount = item.statistics?.episodeFileCount ?? 0
                const totalCount = item.statistics?.episodeCount ?? 0
                return {
                  id: `lib-sonarr-${item.id}`,
                  titleId: liveTitleId('sonarr', item.id),
                  title: item.title,
                  year: item.year,
                  subtitle: 'Series',
                  poster: sonarrPosterUrl(item, service.baseUrl) ?? '',
                  service: 'sonarr',
                  monitored: item.monitored,
                  hasFile: fileCount > 0 && (totalCount === 0 || fileCount >= totalCount),
                  sizeOnDisk: item.statistics?.sizeOnDisk ?? 0,
                  added: item.added,
                  rating: item.ratings?.value,
                  status: item.status,
                  episodeFileCount: fileCount,
                  episodeCount: totalCount,
                }
              })
          }
          if (service.type === 'radarr') {
            const movies = await getRadarrMovies(settings, service)
            return movies
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title))
              .slice(0, 1000)
              .map((item): LibraryItem => ({
                id: `lib-radarr-${item.id}`,
                titleId: liveTitleId('radarr', item.id),
                title: item.title,
                year: item.year,
                subtitle: 'Movie',
                poster: radarrPosterUrl(item, service.baseUrl) ?? '',
                service: 'radarr',
                monitored: item.monitored,
                hasFile: item.hasFile,
                sizeOnDisk: item.sizeOnDisk ?? 0,
                added: item.added,
                rating: item.ratings?.imdb?.value ?? item.ratings?.tmdb?.value ?? item.ratings?.value,
                status: item.status,
              }))
          }
          const albums = await getLidarrAlbums(settings, service)
          return albums
            .slice()
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, 1000)
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
                monitored: item.monitored,
                hasFile: false,
                sizeOnDisk: 0,
                added: item.releaseDate,
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
