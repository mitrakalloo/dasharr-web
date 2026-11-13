import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { ProwlarrIndexersBlock } from '@/features/overview/ProwlarrIndexersBlock'
import { useStackHealth } from '@/hooks/useStackHealth'
import { serviceAccent } from '@/lib/serviceColors'
import type { HealthState } from '@/hooks/useServiceHealth'

interface HealthSheetProps {
  open: boolean
  onClose: () => void
}

function detailFor(state: HealthState | undefined): string {
  if (!state || state.status === 'idle') return 'Waiting…'
  if (state.status === 'loading') return 'Checking…'
  if (state.status === 'success') return state.label
  return state.error
}

export function HealthSheet({ open, onClose }: HealthSheetProps) {
  const { services, health, online } = useStackHealth()

  return (
    <BottomSheet open={open} onClose={onClose} title="System health">
      {services.length === 0 ? (
        <div className="space-y-3 py-2">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No services configured yet. Add Sonarr, Radarr, Seerr, or a download client in Settings.
          </p>
          <Link
            to="/settings"
            onClick={onClose}
            className="inline-flex min-h-[var(--tap)] items-center text-sm font-medium text-[var(--color-accent)]"
          >
            Open Settings
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {online}/{services.length} services online
          </p>

          <div className="mt-4 space-y-2">
            {services.map((service) => {
              const state = health[service.id]
              const onlineNow = state?.status === 'success'
              const checking =
                !state || state.status === 'idle' || state.status === 'loading'

              return (
                <div
                  key={service.id}
                  className="flex min-h-[var(--tap)] items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-3"
                >
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: serviceAccent(service.type) }}
                    >
                      {service.name}
                    </p>
                    <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                      {detailFor(state)}
                    </p>
                  </div>
                  <Badge
                    color={
                      checking ? '#a1a1aa' : onlineNow ? '#34d399' : '#f43f5e'
                    }
                  >
                    {checking ? 'Checking' : onlineNow ? 'Online' : 'Down'}
                  </Badge>
                </div>
              )
            })}
          </div>

          <ProwlarrIndexersBlock />
        </>
      )}
    </BottomSheet>
  )
}
