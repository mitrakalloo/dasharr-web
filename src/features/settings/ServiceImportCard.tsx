import { useState } from 'react'
import { Import } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfigStore } from '@/stores/configStore'
import { SERVICE_META, type ServiceType } from '@/types/config'

/** Paste a dasharr://add?… deep link or JSON service row (no camera). */
export function ServiceImportCard() {
  const addService = useConfigStore((state) => state.addService)
  const [raw, setRaw] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleImport() {
    const trimmed = raw.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      if (trimmed.startsWith('dasharr://add')) {
        const url = new URL(trimmed.replace('dasharr://', 'https://dasharr.local/'))
        const type = (url.searchParams.get('type') ?? 'sonarr') as ServiceType
        if (!(type in SERVICE_META)) throw new Error(`Unknown type ${type}`)
        await addService({
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
      await addService({
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
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel space-y-3.5 rounded-[var(--radius-2xl)] p-4">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
          Quick import
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Paste a <code className="rounded bg-[var(--color-surface-subtle)] px-1 py-0.5 font-mono text-[11px]">dasharr://add</code> link or service JSON object.
        </p>
      </div>
      <Input
        label="Deep link or JSON"
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        onClear={() => setRaw('')}
        placeholder="dasharr://add?type=sonarr&url=…&apiKey=…"
      />
      <Button
        size="sm"
        variant="secondary"
        loading={busy}
        disabled={!raw.trim()}
        onClick={() => void handleImport()}
      >
        <Import className="size-3.5" />
        Import service
      </Button>
    </section>
  )
}
