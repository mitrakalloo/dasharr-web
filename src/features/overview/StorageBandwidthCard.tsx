import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SpeedValue } from '@/components/ui/SpeedValue'
import { DEMO_STORAGE, type DemoStorage } from '@/data/demoDashboard'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDiskSpace } from '@/hooks/useDiskSpace'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { parseSpeedMBps } from '@/lib/parseSpeed'

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
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Storage & bandwidth</h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {isDemo ? 'Tower · last 24h' : 'From *arr disk space + active downloads'}
          </p>
        </div>
        <p className="text-sm font-medium text-emerald-300">
          ↓ <SpeedValue value={liveSpeed} />
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {!isDemo && disks.status === 'loading' ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">Loading disks…</p>
        ) : null}
        {!isDemo && disks.status === 'error' ? (
          <EmptyState title="Couldn’t load disks" description={disks.error} />
        ) : null}
        {volumes.length === 0 && disks.status !== 'loading' ? (
          <EmptyState
            title="No disk data"
            description="Sonarr, Radarr, or Lidarr diskspace will show here."
          />
        ) : null}
        {volumes.map((volume) => {
          const pct = volume.totalTb > 0 ? (volume.usedTb / volume.totalTb) * 100 : 0
          const free = Math.max(0, volume.totalTb - volume.usedTb).toFixed(2)
          return (
            <div key={volume.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="font-medium">{volume.label}</span>
                <span className="tabular text-[var(--color-muted-foreground)]">
                  {free} TB free · {volume.path}
                </span>
              </div>
              <ProgressBar
                value={mounted ? pct : 0}
                animated
                color={
                  pct > 85
                    ? 'var(--color-destructive)'
                    : pct > 70
                      ? 'var(--color-warning)'
                      : 'var(--color-success)'
                }
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
