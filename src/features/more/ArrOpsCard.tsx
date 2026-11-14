import { toast } from 'sonner'
import { RefreshCw, Rss, Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import {
  refreshMonitoredArr,
  rssSyncArr,
  searchMissingArr,
} from '@/lib/services/arr.commands'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

async function runForArr(
  services: ServiceConfig[],
  label: string,
  action: (service: ServiceConfig) => Promise<unknown>,
) {
  const targets = services.filter(
    (service) =>
      service.enabled &&
      (service.type === 'sonarr' || service.type === 'radarr' || service.type === 'lidarr'),
  )
  if (targets.length === 0) {
    toast.message('Configure Sonarr, Radarr, or Lidarr first')
    return
  }
  try {
    await Promise.all(targets.map((service) => action(service)))
    toast.success(`${label} sent to ${targets.length} service${targets.length === 1 ? '' : 's'}`)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : `${label} failed`)
  }
}

export function ArrOpsCard() {
  const { isDemo, hasAny } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)

  if (isDemo || !hasAny('sonarr', 'radarr', 'lidarr')) return null

  return (
    <div className="panel space-y-3 rounded-2xl p-4">
      <div>
        <h2 className="text-sm font-semibold">*arr commands</h2>
        <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
          Run library-wide operations across configured *arr apps
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() =>
            void runForArr(services, 'Search missing', (service) =>
              searchMissingArr(settings, service),
            )
          }
        >
          <Search className="size-4" aria-hidden />
          Search missing
        </Button>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() =>
            void runForArr(services, 'RSS sync', (service) =>
              rssSyncArr(settings, service),
            )
          }
        >
          <Rss className="size-4" aria-hidden />
          RSS sync
        </Button>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() =>
            void runForArr(services, 'Refresh monitored', (service) =>
              refreshMonitoredArr(settings, service),
            )
          }
        >
          <RefreshCw className="size-4" aria-hidden />
          Refresh
        </Button>
      </div>
    </div>
  )
}
