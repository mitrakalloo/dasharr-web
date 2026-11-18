import { toast } from 'sonner'

import type { DemoRelease } from '@/data/demoDashboard'
import { syncTitleMonitored } from '@/hooks/useMonitorTitle'
import { commandRadarrMoviesSearch } from '@/lib/services/radarr'
import { commandSonarrEpisodeSearch } from '@/lib/services/sonarr'
import type { AppSettings, ServiceConfig } from '@/types/config'

export function useCalendarActions(input: {
  isDemo: boolean
  settings: AppSettings
  services: ServiceConfig[]
  events: DemoRelease[]
  toggleMonitored: (id: string) => void
}) {
  function handleToggle(id: string) {
    const event = input.events.find((entry) => entry.id === id)
    const next = !(event?.monitored ?? false)
    input.toggleMonitored(id)
    if (input.isDemo || !event?.titleId) {
      toast.message(next ? 'Monitored (local)' : 'Unmonitored (local)')
      return
    }
    void syncTitleMonitored(input.settings, input.services, event.titleId, next).then((ok) => {
      if (!ok) input.toggleMonitored(id)
    })
  }

  async function handleSearch(id: string) {
    const event = input.events.find((entry) => entry.id === id)
    if (!event?.searchId) {
      toast.error('No search target for this release')
      return
    }
    if (input.isDemo) {
      toast.message(`Search queued for ${event.title}`)
      return
    }
    const service = input.services.find((item) => item.type === event.service && item.enabled)
    if (!service) {
      toast.error(`No ${event.service} service configured`)
      return
    }
    try {
      if (event.service === 'sonarr') {
        await commandSonarrEpisodeSearch(input.settings, service, [event.searchId])
      } else if (event.service === 'radarr') {
        await commandRadarrMoviesSearch(input.settings, service, [event.searchId])
      } else {
        toast.error('Search isn’t supported for this service yet')
        return
      }
      toast.success(`Searching for ${event.title}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Search failed')
    }
  }

  return { handleToggle, handleSearch }
}
