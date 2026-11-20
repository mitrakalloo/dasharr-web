import { useState } from 'react'
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

type ArrOp = 'missing' | 'rss' | 'refresh'

export function ArrOpsCard() {
  const { isDemo, hasAny } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const [busyOp, setBusyOp] = useState<ArrOp | null>(null)

  if (isDemo || !hasAny('sonarr', 'radarr', 'lidarr')) return null

  async function runForArr(
    op: ArrOp,
    label: string,
    action: (service: ServiceConfig) => Promise<unknown>,
  ) {
    if (busyOp) return
    const targets = services.filter(
      (service) =>
        service.enabled &&
        (service.type === 'sonarr' || service.type === 'radarr' || service.type === 'lidarr'),
    )
    if (targets.length === 0) {
      toast.message('Configure Sonarr, Radarr, or Lidarr first')
      return
    }
    setBusyOp(op)
    try {
      await Promise.all(targets.map((service) => action(service)))
      toast.success(`${label} sent to ${targets.length} service${targets.length === 1 ? '' : 's'}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${label} failed`)
    } finally {
      setBusyOp(null)
    }
  }

  return (
    <section className="panel space-y-3.5 rounded-[var(--radius-2xl)] p-4">
      <div>
        <h2 className="font-display text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
          *arr commands
        </h2>
        <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
          Run library-wide operations across your active *arr apps
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          size="sm"
          variant="secondary"
          loading={busyOp === 'missing'}
          disabled={busyOp !== null}
          onClick={() =>
            void runForArr('missing', 'Search missing', (service) =>
              searchMissingArr(settings, service),
            )
          }
        >
          <Search className="size-3.5" aria-hidden="true" />
          Search missing
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={busyOp === 'rss'}
          disabled={busyOp !== null}
          onClick={() =>
            void runForArr('rss', 'RSS sync', (service) => rssSyncArr(settings, service))
          }
        >
          <Rss className="size-3.5" aria-hidden="true" />
          RSS sync
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={busyOp === 'refresh'}
          disabled={busyOp !== null}
          onClick={() =>
            void runForArr('refresh', 'Refresh monitored', (service) =>
              refreshMonitoredArr(settings, service),
            )
          }
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Refresh
        </Button>
      </div>
    </section>
  )
}
