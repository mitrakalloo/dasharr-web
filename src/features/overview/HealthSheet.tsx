import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Inbox,
  Settings,
} from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { ProwlarrIndexersBlock } from '@/features/overview/ProwlarrIndexersBlock'
import { useArrHealthWarnings } from '@/hooks/useArrHealthWarnings'
import { useStackHealth } from '@/hooks/useStackHealth'
import { serviceAccent } from '@/lib/serviceColors'
import type { HealthState } from '@/hooks/useServiceHealth'

interface HealthSheetProps {
  open: boolean
  onClose: () => void
  pendingRequests?: number
}

function detailFor(state: HealthState | undefined): string {
  if (!state || state.status === 'idle') return 'Waiting…'
  if (state.status === 'loading') return 'Checking…'
  if (state.status === 'success') return state.label
  return state.error
}

export function HealthSheet({ open, onClose, pendingRequests = 0 }: HealthSheetProps) {
  const { services, health, online } = useStackHealth()
  const arrHealth = useArrHealthWarnings(open)

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="System health & alerts"
      subtitle={
        services.length > 0
          ? `${online} of ${services.length} services online${
              arrHealth.count > 0 ? ` · ${arrHealth.count} ${arrHealth.count === 1 ? 'warning' : 'warnings'}` : ''
            }`
          : undefined
      }
      desktop="drawer"
    >
      {services.length === 0 ? (
        <div className="space-y-4 py-2">
          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            No services configured yet. Add Sonarr, Radarr, Seerr, or a download client in Settings.
          </p>
          <Link to="/settings?focus=services" onClick={onClose} className="inline-flex">
            <Button variant="secondary" size="sm">
              <Settings className="size-4" aria-hidden />
              Open Settings
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingRequests > 0 ? (
            <Link
              to="/requests?status=pending"
              onClick={onClose}
              className="flex min-h-[52px] items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] px-3.5 py-2.5 transition-colors hover:border-[var(--color-primary)]/50"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Inbox className="size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">
                    {pendingRequests} pending {pendingRequests === 1 ? 'request' : 'requests'}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Review and approve in Requests
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
            </Link>
          ) : null}

          {arrHealth.warnings.length > 0 ? (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-warning)]">
                <AlertTriangle className="size-3.5" aria-hidden />
                Service warnings ({arrHealth.warnings.length})
              </p>
              {arrHealth.warnings.map((warning) => (
                <div
                  key={warning.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/25 bg-[var(--color-warning-muted)]/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/service/${warning.serviceId}`}
                      onClick={onClose}
                      className="min-w-0 flex-1 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: serviceAccent(warning.serviceType) }}
                        >
                          {warning.serviceName}
                        </span>
                        <Badge tone={warning.type === 'error' ? 'danger' : 'warning'}>
                          {warning.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--color-foreground)] group-hover:underline">
                        {warning.message}
                      </p>
                    </Link>
                    {warning.wikiUrl ? (
                      <a
                        href={warning.wikiUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open documentation"
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]"
                      >
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
              Connected services
            </p>
            {services.map((service) => {
              const state = health[service.id]
              const onlineNow = state?.status === 'success'
              const checking =
                !state || state.status === 'idle' || state.status === 'loading'

              return (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  onClick={onClose}
                  className="flex min-h-[54px] items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3.5 py-2.5 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)]"
                >
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold tracking-tight"
                      style={{ color: serviceAccent(service.type) }}
                    >
                      {service.name}
                    </p>
                    <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                      {detailFor(state)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      dot
                      tone={checking ? 'neutral' : onlineNow ? 'success' : 'danger'}
                    >
                      {checking ? 'Checking' : onlineNow ? 'Online' : 'Offline'}
                    </Badge>
                    <ChevronRight className="size-4 text-[var(--color-muted-foreground)]" aria-hidden />
                  </div>
                </Link>
              )
            })}
          </div>

          <ProwlarrIndexersBlock onSelect={onClose} />
        </div>
      )}
    </BottomSheet>
  )
}
