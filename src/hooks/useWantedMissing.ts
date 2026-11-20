import { useMemo } from 'react'

import { usePolling } from '@/hooks/usePolling'
import { liveTitleId } from '@/lib/liveTitleId'
import { getLidarrWantedMissing } from '@/lib/services/lidarr'
import { getRadarrWantedCutoff, getRadarrWantedMissing } from '@/lib/services/radarr'
import { getSonarrWantedCutoff, getSonarrWantedMissing } from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

export type WantedMode = 'missing' | 'cutoff'

export interface WantedItem {
  id: string
  titleId: string
  serviceId: string
  rawItemId: number
  title: string
  subtitle: string
  service: 'sonarr' | 'radarr' | 'lidarr'
}

export function useWantedMissing(enabled: boolean, mode: WantedMode = 'missing') {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const sources = useMemo(
    () =>
      services.filter(
        (service) =>
          service.enabled &&
          (service.type === 'sonarr' ||
            service.type === 'radarr' ||
            (mode === 'missing' && service.type === 'lidarr')),
      ),
    [mode, services],
  )

  const key = `${mode}:${sources.map((service) => service.id).join(',')}`
  const state = usePolling(
    key,
    async () => {
      const settled = await Promise.allSettled(
        sources.map(async (service) => {
          if (service.type === 'sonarr') {
            const records =
              mode === 'cutoff'
                ? await getSonarrWantedCutoff(settings, service)
                : await getSonarrWantedMissing(settings, service)
            return records.map(
              (record): WantedItem => ({
                id: `sonarr-${mode}-${service.id}-${record.id}`,
                titleId: liveTitleId('sonarr', record.seriesId),
                serviceId: service.id,
                rawItemId: record.id,
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
                id: `lidarr-${mode}-${service.id}-${record.id}`,
                titleId: liveTitleId('lidarr', record.id),
                serviceId: service.id,
                rawItemId: record.id,
                title: record.title,
                subtitle: record.artist?.artistName ?? 'Album missing',
                service: 'lidarr',
              }),
            )
          }
          const records =
            mode === 'cutoff'
              ? await getRadarrWantedCutoff(settings, service)
              : await getRadarrWantedMissing(settings, service)
          return records.map(
            (record): WantedItem => ({
              id: `radarr-${mode}-${service.id}-${record.id}`,
              titleId: liveTitleId('radarr', record.id),
              serviceId: service.id,
              rawItemId: record.id,
              title: record.title,
              subtitle: record.year
                ? `${record.year}${mode === 'cutoff' ? ' · Upgrade available' : ''}`
                : mode === 'cutoff'
                  ? 'Cutoff unmet'
                  : 'Movie missing',
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
