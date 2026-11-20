import { AlertCircle, CheckCircle2, PlugZap, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useServiceForm } from '@/features/settings/useServiceForm'
import { SERVICE_META, type ServiceType } from '@/types/config'

const typeOptions = (Object.keys(SERVICE_META) as ServiceType[]).map((type) => ({
  value: type,
  label: SERVICE_META[type].label,
}))

export function ServiceForm() {
  const form = useServiceForm()

  return (
    <form
      onSubmit={form.handleSubmit}
      className="panel space-y-5 rounded-[var(--radius-2xl)] p-5"
    >
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
          Add service
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Credentials are encrypted on the server and used only when communicating with your stack.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Service type"
          value={form.type}
          options={typeOptions}
          onChange={(event) => form.handleTypeChange(event.target.value as ServiceType)}
        />
        <Input
          label="Display name"
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
        />
        <Input
          wrapperClassName="md:col-span-2"
          label="Base URL"
          value={form.baseUrl}
          onChange={(e) => form.setBaseUrl(e.target.value)}
          placeholder="http://192.168.1.10:8989"
        />
        <Input
          label="Local URL (optional)"
          value={form.localUrl}
          onChange={(e) => form.setLocalUrl(e.target.value)}
          placeholder="http://192.168.1.10:8989"
        />
        <Input
          label="Remote URL (optional)"
          value={form.remoteUrl}
          onChange={(e) => form.setRemoteUrl(e.target.value)}
          placeholder="https://sonarr.example.com"
        />
        <Select
          wrapperClassName="md:col-span-2"
          label="URL routing mode"
          value={form.urlMode}
          options={[
            { value: 'auto', label: 'Auto (prefer local when reachable)' },
            { value: 'local', label: 'Always local' },
            { value: 'remote', label: 'Always remote' },
          ]}
          onChange={(event) =>
            form.setUrlMode(event.target.value as 'auto' | 'local' | 'remote')
          }
        />
        {form.meta.needsApiKey ? (
          <Input
            wrapperClassName="md:col-span-2"
            label={form.type === 'deluge' ? 'Web password' : 'API key'}
            type="password"
            value={form.apiKey}
            onChange={(e) => form.setApiKey(e.target.value)}
            placeholder="Paste API key or token"
          />
        ) : null}
        {form.meta.needsBasicAuth ? (
          <>
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => form.setUsername(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => form.setPassword(e.target.value)}
            />
          </>
        ) : null}
      </div>

      {form.test.status === 'success' ? (
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-success)]/25 bg-[var(--color-success-muted)] px-3 py-2.5 text-xs font-medium text-[var(--color-success)]">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          <span>Connected · v{form.test.version}</span>
        </div>
      ) : null}

      {form.test.status === 'error' ? (
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-destructive)]/25 bg-[var(--color-destructive-muted)] px-3 py-2.5 text-xs font-medium text-[var(--color-destructive)]">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{form.test.message}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <Button
          type="button"
          variant="secondary"
          loading={form.test.status === 'loading'}
          onClick={() => void form.handleTest()}
        >
          <PlugZap className="size-4" />
          Test connection
        </Button>
        <Button type="submit" loading={form.busy}>
          <Plus className="size-4" />
          Save service
        </Button>
      </div>
    </form>
  )
}
