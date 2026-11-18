import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import {
  importManualFiles,
  listManualImport,
  type ManualImportCandidate,
} from '@/lib/services/arr.manualImport'
import { useConfigStore } from '@/stores/configStore'

export function ManualImportPage() {
  const { isDemo, hasAny, hydrated } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const allServices = useConfigStore((state) => state.services)
  const services = useMemo(
    () =>
      allServices.filter(
        (service) =>
          service.enabled && (service.type === 'sonarr' || service.type === 'radarr'),
      ),
    [allServices],
  )
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [candidates, setCandidates] = useState<ManualImportCandidate[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const service = services.find((entry) => entry.id === serviceId) ?? services[0]

  async function load() {
    if (!service) return
    setStatus('loading')
    try {
      const rows = await listManualImport(settings, service)
      setCandidates(rows)
      setSelected(new Set())
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed')
      setStatus('error')
    }
  }

  async function runImport() {
    if (!service || selected.size === 0) return
    const files = candidates
      .filter((row) => selected.has(row.path))
      .map((row) => ({
        path: row.path,
        folderName: row.folderName,
        downloadId: row.downloadId,
      }))
    try {
      await importManualFiles(settings, service, files, 'move')
      toast.success('Manual import queued')
      void load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    }
  }

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  if (isDemo || !hasAny('sonarr', 'radarr')) {
    return (
      <div>
        <SubpageHeader title="Manual import" backTo="/more" />
        <div className="px-4 pt-4">
          <EmptyState
            title="Sonarr or Radarr required"
            description="Add an Arr app to import completed downloads manually."
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <SubpageHeader title="Manual import" subtitle="Import completed downloads" backTo="/more" />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <Select
          label="Service"
          value={service?.id ?? ''}
          options={services.map((entry) => ({ value: entry.id, label: entry.name }))}
          onChange={(event) => setServiceId(event.target.value)}
        />
        <Button variant="secondary" onClick={() => void load()}>
          {status === 'loading' ? 'Loading…' : 'Scan import folder'}
        </Button>
        {status === 'error' ? <EmptyState title="Scan failed" description={error} /> : null}
        <div className="space-y-2">
          {candidates.map((row) => {
            const checked = selected.has(row.path)
            return (
              <label
                key={row.path}
                className="flex cursor-pointer gap-3 panel rounded-[var(--radius-2xl)] px-3 py-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelected((prev) => {
                      const next = new Set(prev)
                      if (next.has(row.path)) next.delete(row.path)
                      else next.add(row.path)
                      return next
                    })
                  }
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {row.movie?.title ?? row.series?.title ?? row.name ?? row.folderName ?? row.path}
                  </span>
                  <span className="block truncate text-xs text-[var(--color-muted-foreground)]">
                    {row.relativePath ?? row.path}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <Button className="w-full" disabled={selected.size === 0} onClick={() => void runImport()}>
          Import selected ({selected.size})
        </Button>
      </div>
    </div>
  )
}
