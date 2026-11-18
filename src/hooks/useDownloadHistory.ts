import { useMemo } from 'react'

import { usePolling } from '@/hooks/usePolling'
import { liveTitleId } from '@/lib/liveTitleId'
import { getRadarrHistory } from '@/lib/services/radarr'
import { getSonarrHistory } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

export interface HistoryItem {
  id: string
  titleId?: string
  title: string
  subtitle: string
  eventType: string
  date: string
  dateMs: number
  service: 'sonarr' | 'radarr'
}

export function useDownloadHistory(enabled: boolean) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const sources = useMemo(
    () =>
      services.filter(
        (service) =>
          service.enabled && (service.type === 'sonarr' || service.type === 'radarr'),
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
            const records = await getSonarrHistory(settings, service)
            return records.map(
              (record): HistoryItem => ({
                id: `sonarr-hist-${record.id}`,
                titleId: record.seriesId
                  ? liveTitleId('sonarr', record.seriesId)
                  : undefined,
                title: record.series?.title ?? record.sourceTitle ?? 'Sonarr event',
                subtitle: record.sourceTitle ?? record.eventType,
                eventType: record.eventType,
                dateMs: new Date(record.date).getTime(),
                date: new Date(record.date).toLocaleString(),
                service: 'sonarr',
              }),
            )
          }
          const records = await getRadarrHistory(settings, service)
          return records.map(
            (record): HistoryItem => ({
              id: `radarr-hist-${record.id}`,
              titleId: record.movieId ? liveTitleId('radarr', record.movieId) : undefined,
              title: record.movie?.title ?? record.sourceTitle ?? 'Radarr event',
              subtitle: record.sourceTitle ?? record.eventType,
              eventType: record.eventType,
              dateMs: new Date(record.date).getTime(),
              date: new Date(record.date).toLocaleString(),
              service: 'radarr',
            }),
          )
        }),
      )
      return settled
        .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
        .sort((a, b) => b.dateMs - a.dateMs)
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
