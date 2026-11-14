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
      className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
    >
      <div>
        <h2 className="text-base font-semibold">Add service</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Credentials never leave this browser except when calling your services (or the local
          proxy).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Type"
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
          label="Base URL"
          value={form.baseUrl}
          onChange={(e) => form.setBaseUrl(e.target.value)}
          placeholder="http://192.168.1.10:8989"
          className="md:col-span-2"
        />
        {form.meta.needsApiKey ? (
          <Input
            label={form.type === 'deluge' ? 'Web password' : 'API key'}
            type="password"
            value={form.apiKey}
            onChange={(e) => form.setApiKey(e.target.value)}
            className="md:col-span-2"
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
        <p className="text-sm text-emerald-300">Connected · v{form.test.version}</p>
      ) : null}
      {form.test.status === 'error' ? (
        <p className="text-sm text-rose-300">{form.test.message}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={form.test.status === 'loading'}
          onClick={() => void form.handleTest()}
        >
          {form.test.status === 'loading' ? 'Testing…' : 'Test connection'}
        </Button>
        <Button type="submit">Save service</Button>
      </div>
    </form>
  )
}
