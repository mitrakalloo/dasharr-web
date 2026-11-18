import { useState } from 'react'
import { PlugZap, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { probeService } from '@/lib/services/probe'
import { serviceAccent } from '@/lib/serviceColors'
import { useConfigStore } from '@/stores/configStore'
import { SERVICE_META } from '@/types/config'

export function ServiceList() {
  const settings = useConfigStore((s) => s.settings)
  const services = useConfigStore((s) => s.services)
  const removeService = useConfigStore((s) => s.removeService)
  const updateService = useConfigStore((s) => s.updateService)
  const [testingId, setTestingId] = useState<string | null>(null)

  if (services.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">No services configured yet.</p>
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

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <article
          key={service.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{service.name}</h3>
              <Badge color={serviceAccent(service.type)}>
                {SERVICE_META[service.type]?.label ?? service.type}
              </Badge>
              <Badge color={service.enabled ? '#34d399' : undefined}>
                {service.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <p className="mt-1 truncate text-xs text-[var(--color-muted-foreground)]">
              {service.baseUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={testingId === service.id}
              onClick={() => void handleTest(service.id)}
              className="gap-1.5"
            >
              <PlugZap className="size-4" />
              {testingId === service.id ? 'Testing…' : 'Test'}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                void updateService(service.id, { enabled: !service.enabled }).catch((error) =>
                  toast.error(error instanceof Error ? error.message : 'Update failed'),
                )
              }
            >
              {service.enabled ? 'Disable' : 'Enable'}
            </Button>
            <IconButton
              label={`Remove ${service.name}`}
              tone="danger"
              onClick={() => {
                void removeService(service.id)
                  .then(() => toast.message('Service removed'))
                  .catch((error) =>
                    toast.error(error instanceof Error ? error.message : 'Remove failed'),
                  )
              }}
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        </article>
      ))}
    </div>
  )
}
