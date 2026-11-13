import { serviceJson } from '@/lib/http/client'
import type { SonarrSeries } from '@/lib/services/sonarr.types'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface SonarrCalendarEpisode {
  id: number
  seriesId?: number
  title?: string
  seasonNumber: number
  episodeNumber: number
  airDate?: string
  airDateUtc?: string
  hasFile: boolean
  monitored: boolean
  series?: SonarrSeries
}

export async function getSonarrCalendar(
  settings: AppSettings,
  service: ServiceConfig,
  start: string,
  end: string,
) {
  const params = new URLSearchParams({
    start,
    end,
    includeSeries: 'true',
    unmonitored: 'false',
  })
  return serviceJson<SonarrCalendarEpisode[]>(
    settings,
    service,
    `/api/v3/calendar?${params.toString()}`,
  )
}
