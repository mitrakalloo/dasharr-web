import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useConfigStore } from '@/stores/configStore'
import type { ConnectionMode } from '@/types/config'

export function ConnectionSettings() {
  const settings = useConfigStore((s) => s.settings)
  const updateSettings = useConfigStore((s) => s.updateSettings)

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <h2 className="text-base font-semibold">Connection</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Use <strong>proxy</strong> when self-hosting Dasharr (recommended). Use{' '}
          <strong>direct</strong> only if each service allows browser CORS.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Mode"
          value={settings.connectionMode}
          options={[
            { value: 'proxy', label: 'Proxy (self-hosted API)' },
            { value: 'direct', label: 'Direct (browser → service)' },
          ]}
          onChange={(event) =>
            updateSettings({ connectionMode: event.target.value as ConnectionMode })
          }
        />
        <Input
          label="Proxy URL"
          value={settings.proxyUrl}
          onChange={(event) => updateSettings({ proxyUrl: event.target.value })}
          hint="Default /api/proxy when running Dasharr’s server"
        />
        <div className="md:col-span-2">
          <Input
            label="Proxy secret"
            type="password"
            value={settings.proxySecret}
            onChange={(event) => updateSettings({ proxySecret: event.target.value })}
            hint="Must match PROXY_SECRET on the server if set"
          />
        </div>
      </div>
    </section>
  )
}
