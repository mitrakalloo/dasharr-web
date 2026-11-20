import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Container,
  HardDrive,
  Play,
  RefreshCw,
  Search,
  Square,
  Thermometer,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { serviceAccent } from '@/lib/serviceColors'
import {
  getUnraidSnapshot,
  startUnraidContainer,
  stopUnraidContainer,
  type UnraidSnapshot,
} from '@/lib/services/unraid'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

interface UnraidHubPanelProps {
  service: ServiceConfig
}

function formatKbToTb(value?: string): string {
  const kb = Number(value ?? 0)
  if (!Number.isFinite(kb) || kb <= 0) return '0.0 TB'
  const tb = kb / (1024 * 1024 * 1024)
  if (tb >= 1) return `${tb.toFixed(2)} TB`
  const gb = kb / (1024 * 1024)
  return `${gb.toFixed(0)} GB`
}

function tempTone(temp?: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (temp === undefined || temp === null || temp <= 0) return 'neutral'
  if (temp >= 48) return 'danger'
  if (temp >= 40) return 'warning'
  return 'success'
}

export function UnraidHubPanel({ service }: UnraidHubPanelProps) {
  const settings = useConfigStore((state) => state.settings)
  const [snapshot, setSnapshot] = useState<UnraidSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'running' | 'stopped'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUnraidSnapshot(settings, service)
      setSnapshot(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Unraid snapshot')
    } finally {
      setLoading(false)
    }
  }, [service, settings])

  useEffect(() => {
    void load()
  }, [load])

  async function toggleContainer(id: string, running: boolean, label: string) {
    setBusyId(id)
    try {
      if (running) {
        await stopUnraidContainer(settings, service, id)
        toast.success(`Stopped ${label}`)
      } else {
        await startUnraidContainer(settings, service, id)
        toast.success(`Started ${label}`)
      }
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Container action failed')
    } finally {
      setBusyId(null)
    }
  }

  const containers = useMemo(() => {
    const list = snapshot?.containers ?? []
    const q = query.trim().toLowerCase()
    return list
      .filter((c) => {
        const isRunning = (c.state ?? '').toLowerCase() === 'running'
        if (filter === 'running' && !isRunning) return false
        if (filter === 'stopped' && isRunning) return false
        if (!q) return true
        const name = (c.names?.[0] ?? '').replace(/^\//, '').toLowerCase()
        const image = (c.image ?? '').toLowerCase()
        return name.includes(q) || image.includes(q)
      })
      .sort((a, b) => {
        const aRun = (a.state ?? '').toLowerCase() === 'running' ? 0 : 1
        const bRun = (b.state ?? '').toLowerCase() === 'running' ? 0 : 1
        if (aRun !== bRun) return aRun - bRun
        const aName = (a.names?.[0] ?? '').replace(/^\//, '')
        const bName = (b.names?.[0] ?? '').replace(/^\//, '')
        return aName.localeCompare(bName)
      })
  }, [snapshot, query, filter])

  const runningCount = useMemo(
    () =>
      (snapshot?.containers ?? []).filter((c) => (c.state ?? '').toLowerCase() === 'running')
        .length,
    [snapshot],
  )

  if (loading && !snapshot) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-28 rounded-[var(--radius-2xl)]" />
        <div className="skeleton h-48 rounded-[var(--radius-2xl)]" />
      </div>
    )
  }

  if (error && !snapshot) {
    return (
      <EmptyState
        icon={<HardDrive className="size-5" aria-hidden />}
        title="Unraid snapshot unavailable"
        description={error}
        actionLabel="Retry"
        onAction={() => void load()}
      />
    )
  }

  const usedKb = Number(snapshot?.capacity?.used ?? 0)
  const totalKb = Number(snapshot?.capacity?.total ?? 0)
  const arrayPct = totalKb > 0 ? Math.round((usedKb / totalKb) * 100) : 0

  return (
    <div className="space-y-6">
      <section className="panel space-y-4 rounded-[var(--radius-2xl)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-warning)]/25 bg-[var(--color-warning-muted)] text-[var(--color-warning)]">
              <HardDrive className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold tracking-tight">
                Array · {snapshot?.state ?? 'Unknown'}
              </h3>
              <p className="tabular text-xs text-[var(--color-muted-foreground)]">
                {formatKbToTb(snapshot?.capacity?.used)} used of{' '}
                {formatKbToTb(snapshot?.capacity?.total)} ({formatKbToTb(snapshot?.capacity?.free)}{' '}
                free)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={arrayPct > 85 ? 'danger' : arrayPct > 70 ? 'warning' : 'success'}>
              {arrayPct}% used
            </Badge>
            <Button variant="secondary" size="sm" loading={loading} onClick={() => void load()}>
              <RefreshCw className="size-3.5" aria-hidden />
              Refresh
            </Button>
          </div>
        </div>
        <ProgressBar
          value={arrayPct}
          animated
          color={
            arrayPct > 85
              ? 'var(--color-destructive)'
              : arrayPct > 70
                ? 'var(--color-warning)'
                : serviceAccent('unraid')
          }
        />

        {snapshot && snapshot.disks.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.disks.map((disk, idx) => {
              const size = Number(disk.fsSize ?? 0)
              const used = Number(disk.fsUsed ?? 0)
              const pct = size > 0 ? Math.round((used / size) * 100) : 0
              return (
                <div
                  key={`${disk.name ?? 'disk'}-${idx}`}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {disk.name ?? `Disk ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {disk.temp ? (
                        <Badge tone={tempTone(disk.temp)} className="tabular">
                          <Thermometer className="mr-0.5 inline size-3" aria-hidden />
                          {disk.temp}°C
                        </Badge>
                      ) : null}
                      {size > 0 ? (
                        <span className="tabular text-xs text-[var(--color-muted-foreground)]">
                          {pct}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {size > 0 ? (
                    <>
                      <ProgressBar
                        className="mt-2"
                        value={pct}
                        color={
                          pct > 85
                            ? 'var(--color-destructive)'
                            : pct > 70
                              ? 'var(--color-warning)'
                              : 'var(--color-success)'
                        }
                      />
                      <p className="mt-1.5 tabular text-[11px] text-[var(--color-muted-foreground)]">
                        {formatKbToTb(disk.fsUsed)} / {formatKbToTb(disk.fsSize)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-[11px] text-[var(--color-muted-foreground)]">
                      {disk.status ?? 'Parity / standby'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Docker containers"
          description={`${runningCount} running of ${snapshot?.containers.length ?? 0}`}
          count={containers.length}
        />

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter containers by name or image…"
            leadingIcon={<Search className="size-4" aria-hidden />}
            wrapperClassName="flex-1"
          />
          <SegmentedControl
            ariaLabel="Filter containers"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'running', label: 'Running' },
              { value: 'stopped', label: 'Stopped' },
            ]}
          />
        </div>

        {containers.length === 0 ? (
          <EmptyState
            compact
            icon={<Container className="size-5" aria-hidden />}
            title="No matching containers"
            description="Try clearing the search or switching filters."
          />
        ) : (
          <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
            {containers.map((container, idx) => {
              const rawName = (container.names?.[0] ?? `container-${idx}`).replace(/^\//, '')
              const running = (container.state ?? '').toLowerCase() === 'running'
              const containerId = container.id
              return (
                <div
                  key={containerId ?? `${rawName}-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          background: running
                            ? 'var(--color-success)'
                            : 'var(--color-muted-foreground)',
                        }}
                      />
                      <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">
                        {rawName}
                      </p>
                      <Badge tone={running ? 'success' : 'neutral'}>
                        {container.state ?? (running ? 'running' : 'stopped')}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--color-muted-foreground)]">
                      {container.image}
                      {container.status ? ` · ${container.status}` : ''}
                    </p>
                  </div>
                  {containerId ? (
                    <Button
                      size="sm"
                      variant={running ? 'secondary' : 'primary'}
                      loading={busyId === containerId}
                      onClick={() => void toggleContainer(containerId, running, rawName)}
                    >
                      {running ? (
                        <>
                          <Square className="size-3" aria-hidden />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="size-3" aria-hidden />
                          Start
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
