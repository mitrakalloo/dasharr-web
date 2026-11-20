import { useState } from 'react'
import { PlugZap, Server, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Switch } from '@/components/ui/Switch'
import { probeService } from '@/lib/services/probe'
import { serviceAccent } from '@/lib/serviceColors'
import { useConfigStore } from '@/stores/configStore'
import { SERVICE_META, type ServiceConfig } from '@/types/config'

export function ServiceList() {
  const settings = useConfigStore((s) => s.settings)
  const services = useConfigStore((s) => s.services)
  const removeService = useConfigStore((s) => s.removeService)
  const updateService = useConfigStore((s) => s.updateService)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<ServiceConfig | null>(null)

  if (services.length === 0) {
    return (
      <EmptyState
        compact
        icon={<Server className="size-5" aria-hidden="true" />}
        title="No services configured yet"
        description="Add Sonarr, Radarr, qBittorrent, Plex, or any supported service below."
      />
    )
  }

  async function handleTest(id: string) {
    const service = services.find((item) => item.id === id)
    if (!service) return

    setTestingId(id)
    try {
      const version = await probeService(settings, service)
      toast.success(`${service.name} · v${version}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unreachable')
    } finally {
      setTestingId(null)
    }
  }

  async function handleRemove() {
    if (!confirmRemove) return
    const target = confirmRemove
    setConfirmRemove(null)
    try {
      await removeService(target.id)
      toast.message(`Removed ${target.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Remove failed')
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {services.map((service) => {
          const accent = serviceAccent(service.type)
          return (
            <article
              key={service.id}
              className="panel flex flex-col justify-between gap-3.5 rounded-[var(--radius-2xl)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                      color: accent,
                    }}
                  >
                    <Server className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate text-sm font-semibold text-[var(--color-foreground)]">
                        {service.name}
                      </h3>
                      <Badge color={accent}>
                        {SERVICE_META[service.type]?.label ?? service.type}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate font-mono text-[11px] text-[var(--color-muted-foreground)]">
                      {service.baseUrl}
                    </p>
                  </div>
                </div>

                <Switch
                  checked={service.enabled}
                  ariaLabel={`Toggle ${service.name}`}
                  onCheckedChange={(checked) =>
                    void updateService(service.id, { enabled: checked }).catch((error) =>
                      toast.error(error instanceof Error ? error.message : 'Update failed'),
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[var(--color-hairline)] pt-3">
                <Badge tone={service.enabled ? 'success' : 'neutral'} dot>
                  {service.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={testingId === service.id}
                    onClick={() => void handleTest(service.id)}
                  >
                    <PlugZap className="size-3.5" />
                    Test
                  </Button>
                  <IconButton
                    size="sm"
                    label={`Remove ${service.name}`}
                    tone="danger"
                    onClick={() => setConfirmRemove(service)}
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        onClose={() => setConfirmRemove(null)}
        title={`Remove ${confirmRemove?.name ?? 'service'}?`}
        description="Dasharr will disconnect from this service and delete its saved credentials from the server."
        confirmLabel="Remove service"
        tone="danger"
        onConfirm={() => void handleRemove()}
      />
    </>
  )
}
