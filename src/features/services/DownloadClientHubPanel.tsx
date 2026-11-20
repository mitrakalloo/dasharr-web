import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Gauge, Pause, Play } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { serviceAccent } from '@/lib/serviceColors'
import {
  getQbitSpeedMode,
  qbitPauseAll,
  qbitResumeAll,
  toggleQbitAltSpeed,
} from '@/lib/services/qbittorrent'
import { sabPause, sabResume, sabSetSpeedLimit } from '@/lib/services/sabnzbd'
import { titlePath } from '@/data/demoTitles'
import { useConfigStore } from '@/stores/configStore'
import type { ServiceConfig } from '@/types/config'

interface DownloadClientHubPanelProps {
  service: ServiceConfig
}

export function DownloadClientHubPanel({ service }: DownloadClientHubPanelProps) {
  const settings = useConfigStore((state) => state.settings)
  const queue = useDownloadQueue(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [altSpeed, setAltSpeed] = useState<boolean | null>(null)

  const items = useMemo(
    () =>
      queue.items.filter(
        (item) => item.clientServiceId === service.id || item.service === service.type,
      ),
    [queue.items, service.id, service.type],
  )

  useEffect(() => {
    if (service.type !== 'qbittorrent') return
    let cancelled = false
    getQbitSpeedMode(settings, service)
      .then((enabled) => {
        if (!cancelled) setAltSpeed(enabled)
      })
      .catch(() => {
        if (!cancelled) setAltSpeed(null)
      })
    return () => {
      cancelled = true
    }
  }, [service, settings])

  const supportsGlobal = service.type === 'qbittorrent' || service.type === 'sabnzbd'

  async function pauseAll() {
    setBusy('pause')
    try {
      if (service.type === 'qbittorrent') await qbitPauseAll(settings, service)
      else if (service.type === 'sabnzbd') await sabPause(settings, service)
      toast.success(`Paused ${service.name}`)
      queue.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Pause failed')
    } finally {
      setBusy(null)
    }
  }

  async function resumeAll() {
    setBusy('resume')
    try {
      if (service.type === 'qbittorrent') await qbitResumeAll(settings, service)
      else if (service.type === 'sabnzbd') await sabResume(settings, service)
      toast.success(`Resumed ${service.name}`)
      queue.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resume failed')
    } finally {
      setBusy(null)
    }
  }

  async function toggleTurtle() {
    setBusy('turtle')
    try {
      await toggleQbitAltSpeed(settings, service)
      const next = altSpeed === null ? true : !altSpeed
      setAltSpeed(next)
      toast.success(next ? 'Alternative speed limit enabled' : 'Alternative speed limit disabled')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Toggle failed')
    } finally {
      setBusy(null)
    }
  }

  async function setSabLimit(percent: number) {
    setBusy(`limit-${percent}`)
    try {
      await sabSetSpeedLimit(settings, service, percent)
      toast.success(`SABnzbd speed limit set to ${percent}%`)
      queue.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update speed limit')
    } finally {
      setBusy(null)
    }
  }

  const accent = serviceAccent(service.type)

  return (
    <div className="space-y-6">
      {supportsGlobal ? (
        <section className="panel space-y-3 rounded-[var(--radius-2xl)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold tracking-tight">
                Queue & speed controls
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Control active transfers and bandwidth throttling directly
              </p>
            </div>
            {altSpeed !== null ? (
              <Badge tone={altSpeed ? 'warning' : 'neutral'}>
                {altSpeed ? 'Alt speed ON' : 'Normal speed'}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" loading={busy === 'pause'} onClick={() => void pauseAll()}>
              <Pause className="size-3.5" aria-hidden />
              Pause all
            </Button>
            <Button variant="secondary" size="sm" loading={busy === 'resume'} onClick={() => void resumeAll()}>
              <Play className="size-3.5" aria-hidden />
              Resume all
            </Button>
            {service.type === 'qbittorrent' ? (
              <Button
                variant={altSpeed ? 'primary' : 'soft'}
                size="sm"
                loading={busy === 'turtle'}
                onClick={() => void toggleTurtle()}
              >
                <Gauge className="size-3.5" aria-hidden />
                {altSpeed ? 'Disable alt speed' : 'Enable alt speed'}
              </Button>
            ) : null}
            {service.type === 'sabnzbd' ? (
              <div className="flex items-center gap-1.5">
                {[25, 50, 100].map((pct) => (
                  <Button
                    key={pct}
                    variant="soft"
                    size="sm"
                    loading={busy === `limit-${pct}`}
                    onClick={() => void setSabLimit(pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionHeader
          title="Active jobs"
          count={items.length}
          actionLabel="Full queue"
          actionTo="/queue"
        />
        {items.length === 0 ? (
          <EmptyState
            compact
            title="Queue is idle"
            description={`No active downloads reported by ${service.name}.`}
            actionLabel="Open Queue"
            actionTo="/queue"
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.titleId ? titlePath(item.titleId) : '/queue'}
                className="magnetic panel group block space-y-2 rounded-[var(--radius-xl)] p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold group-hover:text-[var(--color-primary)]">
                    {item.title}
                  </p>
                  <span className="tabular shrink-0 text-xs font-semibold" style={{ color: accent }}>
                    {item.progress}%
                  </span>
                </div>
                <ProgressBar
                  value={item.progress}
                  color={accent}
                  live={item.status === 'downloading'}
                />
                <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-muted-foreground)]">
                  <span className="tabular">
                    {item.speed} · ETA {item.eta}
                  </span>
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
