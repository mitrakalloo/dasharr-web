import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ChevronRight, HardDrive } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SpeedValue } from '@/components/ui/SpeedValue'
import { Tooltip } from '@/components/ui/Tooltip'
import { DEMO_STORAGE, type DemoStorage } from '@/data/demoDashboard'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDiskSpace } from '@/hooks/useDiskSpace'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { parseSpeedMBps } from '@/lib/parseSpeed'

function volumeTone(pct: number): string {
  if (pct > 85) return 'var(--color-destructive)'
  if (pct > 70) return 'var(--color-warning)'
  return 'var(--color-success)'
}

function volumeHint(volume: DemoStorage, pct: number, free: string): string {
  if (pct > 85) return `${volume.label}: only ${free} TB free — warning threshold`
  if (pct > 70) return `${volume.label}: ${free} TB free — approaching capacity`
  return `${volume.label}: ${free} TB free of ${volume.totalTb} TB · ${volume.path}`
}

export function StorageBandwidthCard() {
  const { isDemo } = useConfiguredStack()
  const disks = useDiskSpace(!isDemo)
  const queue = useDownloadQueue(!isDemo)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const volumes: DemoStorage[] =
    isDemo ? DEMO_STORAGE : disks.status === 'success' ? disks.data : []

  const liveSpeed = isDemo
    ? 48.2
    : queue.items
        .filter((item) => item.status === 'downloading')
        .reduce((sum, item) => sum + (parseSpeedMBps(item.speed) ?? 0), 0)

  return (
    <section className="panel rounded-[var(--radius-2xl)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/storage"
          className="group flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] transition-colors hover:text-[var(--color-primary)]"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-primary)]">
            <HardDrive className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h2 className="font-display text-sm font-semibold tracking-tight group-hover:text-[var(--color-primary)]">
                Storage & bandwidth
              </h2>
              <ChevronRight
                className="size-3.5 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                aria-hidden
              />
            </div>
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">
              {isDemo ? 'Tower · last 24h' : 'Disk capacity & largest media'}
            </p>
          </div>
        </Link>
        <Link
          to="/queue"
          className="tabular inline-flex items-center gap-1 rounded-full border border-[var(--color-success)]/25 bg-[var(--color-success-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-success)] transition-colors hover:border-[var(--color-success)]/50"
        >
          <ArrowDown className="size-3" aria-hidden />
          <SpeedValue value={liveSpeed} />
        </Link>
      </div>

      <div className="mt-4 space-y-3.5">
        {!isDemo && disks.status === 'loading' ? (
          <div className="space-y-3">
            <div className="skeleton h-10 rounded-[var(--radius-md)]" />
            <div className="skeleton h-10 rounded-[var(--radius-md)]" />
          </div>
        ) : null}
        {!isDemo && disks.status === 'error' ? (
          <EmptyState compact title="Couldn’t load disks" description={disks.error} />
        ) : null}
        {volumes.length === 0 && disks.status !== 'loading' ? (
          <EmptyState
            compact
            title="No disk data"
            description="Sonarr, Radarr, or Lidarr diskspace will show here."
          />
        ) : null}
        {volumes.map((volume) => {
          const pct = volume.totalTb > 0 ? (volume.usedTb / volume.totalTb) * 100 : 0
          const free = Math.max(0, volume.totalTb - volume.usedTb).toFixed(2)
          return (
            <Tooltip key={volume.id} label={volumeHint(volume, pct, free)} className="block w-full">
              <Link
                to="/storage"
                className="block w-full rounded-[var(--radius-lg)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] p-3 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)]"
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-semibold text-[var(--color-foreground)]">
                    {volume.label}
                  </span>
                  <span className="tabular shrink-0 text-[var(--color-muted-foreground)]">
                    {volume.usedTb.toFixed(1)} / {volume.totalTb} TB ({Math.round(pct)}%)
                  </span>
                </div>
                <ProgressBar value={mounted ? pct : 0} animated color={volumeTone(pct)} />
                <p className="mt-1.5 truncate tabular text-[11px] text-[var(--color-muted-foreground)]">
                  {free} TB free · {volume.path}
                </p>
              </Link>
            </Tooltip>
          )
        })}
      </div>
    </section>
  )
}
