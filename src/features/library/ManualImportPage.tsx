import { useMemo, useState } from 'react'
import { Check, FileInput, FolderSearch } from 'lucide-react'
import { toast } from 'sonner'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { Select } from '@/components/ui/Select'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { cn } from '@/lib/cn'
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
  const [status, setStatus] = useState<'idle' | 'loading' | 'scanned' | 'error'>('idle')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  const service = services.find((entry) => entry.id === serviceId) ?? services[0]
  const allSelected = candidates.length > 0 && selected.size === candidates.length

  async function load() {
    if (!service) return
    setStatus('loading')
    try {
      const rows = await listManualImport(settings, service)
      setCandidates(rows)
      setSelected(new Set())
      setStatus('scanned')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed')
      setStatus('error')
    }
  }

  async function runImport() {
    if (!service || selected.size === 0 || importing) return
    setImporting(true)
    const files = candidates
      .filter((row) => selected.has(row.path))
      .map((row) => ({
        path: row.path,
        folderName: row.folderName,
        downloadId: row.downloadId,
      }))
    try {
      await importManualFiles(settings, service, files, 'move')
      toast.success(`Manual import queued for ${files.length} file${files.length === 1 ? '' : 's'}`)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(candidates.map((row) => row.path)))
    }
  }

  if (!hydrated) {
    return <PageSkeleton variant="list" />
  }

  if (isDemo || !hasAny('sonarr', 'radarr')) {
    return (
      <div>
        <SubpageHeader title="Manual import" backTo="/more" />
        <div className="page-pad">
          <EmptyState
            icon={<FileInput className="size-5" aria-hidden="true" />}
            title="Sonarr or Radarr required"
            description="Connect Sonarr or Radarr in Settings to scan and manually import completed downloads."
            actionLabel="Open Settings"
            actionTo="/settings?focus=services"
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <SubpageHeader
        title="Manual import"
        subtitle="Scan and import completed downloads"
        backTo="/more"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Library', to: '/library' },
          { label: 'Manual import' },
        ]}
      />
      <div className="page-pad space-y-5">
        <div className="panel flex flex-col gap-3 rounded-[var(--radius-2xl)] p-4 sm:flex-row sm:items-end">
          <Select
            wrapperClassName="flex-1"
            label="Target service"
            value={service?.id ?? ''}
            options={services.map((entry) => ({ value: entry.id, label: entry.name }))}
            onChange={(event) => {
              setServiceId(event.target.value)
              setCandidates([])
              setSelected(new Set())
              setStatus('idle')
            }}
          />
          <Button
            variant="secondary"
            loading={status === 'loading'}
            onClick={() => void load()}
            className="sm:shrink-0"
          >
            <FolderSearch className="size-4" />
            Scan import folder
          </Button>
        </div>

        {status === 'error' ? <EmptyState title="Scan failed" description={error} /> : null}

        {status === 'scanned' && candidates.length === 0 ? (
          <EmptyState
            icon={<FileInput className="size-5" aria-hidden="true" />}
            title="Import folder is empty"
            description={`No pending files found for ${service?.name ?? 'this service'}.`}
          />
        ) : null}

        {candidates.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[var(--color-muted-foreground)] tabular">
                {selected.size} of {candidates.length} selected
              </p>
              <Button size="sm" variant="ghost" onClick={toggleAll}>
                {allSelected ? 'Clear selection' : 'Select all'}
              </Button>
            </div>

            <div className="space-y-2">
              {candidates.map((row) => {
                const checked = selected.has(row.path)
                return (
                  <button
                    key={row.path}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() =>
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (next.has(row.path)) next.delete(row.path)
                        else next.add(row.path)
                        return next
                      })
                    }
                    className={cn(
                      'panel flex w-full cursor-pointer items-start gap-3 rounded-[var(--radius-2xl)] px-3.5 py-3 text-left transition active:scale-[0.995]',
                      checked
                        ? 'border-[var(--color-primary)]/45 bg-[var(--color-primary-muted)]/35'
                        : 'hover:bg-[var(--color-hover)]',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        checked
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                          : 'border-[var(--color-border)] bg-[var(--color-background)]',
                      )}
                      aria-hidden="true"
                    >
                      {checked ? <Check className="size-3.5 stroke-[2.5]" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[var(--color-foreground)]">
                        {row.movie?.title ??
                          row.series?.title ??
                          row.name ??
                          row.folderName ??
                          row.path}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-[var(--color-muted-foreground)]">
                        {row.relativePath ?? row.path}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <Button
              className="w-full"
              loading={importing}
              disabled={selected.size === 0}
              onClick={() => void runImport()}
            >
              <FileInput className="size-4" />
              Import selected ({selected.size})
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
