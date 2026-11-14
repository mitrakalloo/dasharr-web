import { useMemo } from 'react'

import { liveTitleId } from '@/lib/liveTitleId'
import { getLidarrWantedMissing } from '@/lib/services/lidarr'
import { getRadarrWantedMissing } from '@/lib/services/radarr'
import { getSonarrWantedMissing } from '@/lib/services/sonarr'
import { usePolling } from '@/hooks/usePolling'
import { useConfigStore } from '@/stores/configStore'

export interface WantedItem {
  id: string
  titleId: string
  title: string
  subtitle: string
  service: 'sonarr' | 'radarr' | 'lidarr'
}

export function useWantedMissing(enabled: boolean) {
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

  const key = sources.map((service) => service.id).join(',')
  const state = usePolling(
    key,
    async () => {
      const settled = await Promise.allSettled(
        sources.map(async (service) => {
          if (service.type === 'sonarr') {
            const records = await getSonarrWantedMissing(settings, service)
            return records.map(
              (record): WantedItem => ({
                id: `sonarr-wanted-${record.id}`,
                titleId: liveTitleId('sonarr', record.seriesId),
                title: record.series?.title ?? `Series ${record.seriesId}`,
                subtitle: `S${String(record.seasonNumber).padStart(2, '0')}E${String(record.episodeNumber).padStart(2, '0')} · ${record.title ?? 'Episode'}`,
                service: 'sonarr',
              }),
            )
          }
          if (service.type === 'lidarr') {
            const records = await getLidarrWantedMissing(settings, service)
            return records.map(
              (record): WantedItem => ({
                id: `lidarr-wanted-${record.id}`,
                titleId: liveTitleId('lidarr', record.id),
                title: record.title,
                subtitle: record.artist?.artistName ?? 'Album missing',
                service: 'lidarr',
              }),
            )
          }
          const records = await getRadarrWantedMissing(settings, service)
          return records.map(
            (record): WantedItem => ({
              id: `radarr-wanted-${record.id}`,
              titleId: liveTitleId('radarr', record.id),
              title: record.title,
              subtitle: record.year ? String(record.year) : 'Movie missing',
              service: 'radarr',
            }),
          )
        }),
      )
      return settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    30_000,
    enabled && sources.length > 0,
  )

  return {
    ...state,
    items: state.status === 'success' ? state.data : [],
    hasSources: sources.length > 0,
  }
}
