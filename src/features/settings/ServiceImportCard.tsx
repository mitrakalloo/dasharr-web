import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfigStore } from '@/stores/configStore'
import { SERVICE_META, type ServiceType } from '@/types/config'

/** Paste a dasharr://add?… deep link or JSON service row (no camera). */
export function ServiceImportCard() {
  const addService = useConfigStore((state) => state.addService)
  const hasVault = useConfigStore((state) => state.hasVault)
  const [raw, setRaw] = useState('')

  function handleImport() {
    if (!hasVault) {
      toast.error('Create a vault first')
      return
    }
    const trimmed = raw.trim()
    if (!trimmed) return

    try {
      if (trimmed.startsWith('dasharr://add')) {
        const url = new URL(trimmed.replace('dasharr://', 'https://dasharr.local/'))
        const type = (url.searchParams.get('type') ?? 'sonarr') as ServiceType
        if (!(type in SERVICE_META)) throw new Error(`Unknown type ${type}`)
        addService({
          type,
          name: url.searchParams.get('name') || SERVICE_META[type].label,
          baseUrl: url.searchParams.get('url') || url.searchParams.get('baseUrl') || '',
          apiKey: url.searchParams.get('apiKey') || '',
          username: url.searchParams.get('username') || undefined,
          password: url.searchParams.get('password') || undefined,
          enabled: true,
        })
        toast.success(`${SERVICE_META[type].label} imported from link`)
        setRaw('')
        return
      }

      const parsed = JSON.parse(trimmed) as Record<string, unknown>
      const type = String(parsed.type ?? 'sonarr') as ServiceType
      if (!(type in SERVICE_META)) throw new Error(`Unknown type ${type}`)
      addService({
        type,
        name: String(parsed.name ?? SERVICE_META[type].label),
        baseUrl: String(parsed.baseUrl ?? parsed.url ?? ''),
        localUrl: typeof parsed.localUrl === 'string' ? parsed.localUrl : undefined,
        remoteUrl: typeof parsed.remoteUrl === 'string' ? parsed.remoteUrl : undefined,
        apiKey: String(parsed.apiKey ?? ''),
        username: typeof parsed.username === 'string' ? parsed.username : undefined,
        password: typeof parsed.password === 'string' ? parsed.password : undefined,
        enabled: true,
      })
      toast.success(`${SERVICE_META[type].label} imported`)
      setRaw('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <h2 className="text-base font-semibold">Import service</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Paste a <code className="text-xs">dasharr://add</code> link or service JSON
        </p>
      </div>
      <Input
        label="Link or JSON"
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder='dasharr://add?type=sonarr&url=…&apiKey=…'
      />
      <Button variant="secondary" onClick={handleImport}>
        Import service
      </Button>
    </section>
  )
}
