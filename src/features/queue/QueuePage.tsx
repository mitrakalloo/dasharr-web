import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Activity, ArrowDown, Download, Gauge, Layers, Pause, Play } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SpeedValue } from '@/components/ui/SpeedValue'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { QueueFilterBar } from '@/features/queue/QueueFilterBar'
import { QueueItemCard } from '@/features/queue/QueueItemCard'
import { QueueItemSheet } from '@/features/queue/QueueItemSheet'
import { useQueuePage, type QueueFilter } from '@/features/queue/useQueuePage'
import { useAggregateDownloadSpeed } from '@/hooks/useAggregateDownloadSpeed'
import { cn } from '@/lib/cn'
import {
  qbitPauseAll,
  qbitResumeAll,
  toggleQbitAltSpeed,
} from '@/lib/services/qbittorrent'
import { sabPause, sabResume } from '@/lib/services/sabnzbd'
import { useConfigStore } from '@/stores/configStore'

export function QueuePage() {
  const q = useQueuePage()
  const speed = useAggregateDownloadSpeed()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const [confirmRemove, setConfirmRemove] = useState<DemoQueueItem | null>(null)
  const [globalBusy, setGlobalBusy] = useState<string | null>(null)

  const qbitServices = useMemo(
    () => services.filter((s) => s.enabled && s.type === 'qbittorrent'),
    [services],
  )
  const sabServices = useMemo(
    () => services.filter((s) => s.enabled && s.type === 'sabnzbd'),
    [services],
  )
  const hasGlobalControls = qbitServices.length > 0 || sabServices.length > 0

  const counts = useMemo<Partial<Record<QueueFilter, number>>>(() => {
    const map: Partial<Record<QueueFilter, number>> = { all: q.source.length }
    for (const item of q.source) {
      if (item.status === 'downloading') map.downloading = (map.downloading ?? 0) + 1
      else if (item.status === 'paused') map.paused = (map.paused ?? 0) + 1
      else if (item.status === 'queued') map.queued = (map.queued ?? 0) + 1
      else if (item.status === 'request') map.requests = (map.requests ?? 0) + 1
      else if (item.status === 'watching') map.watching = (map.watching ?? 0) + 1
    }
    return map
  }, [q.source])

  async function runGlobal(action: 'pause' | 'resume' | 'turtle') {
    setGlobalBusy(action)
    try {
      if (action === 'pause') {
        await Promise.all([
          ...qbitServices.map((s) => qbitPauseAll(settings, s)),
          ...sabServices.map((s) => sabPause(settings, s)),
        ])
        toast.success('Paused all download queues')
      } else if (action === 'resume') {
        await Promise.all([
          ...qbitServices.map((s) => qbitResumeAll(settings, s)),
          ...sabServices.map((s) => sabResume(settings, s)),
        ])
        toast.success('Resumed all download queues')
      } else {
        await Promise.all(qbitServices.map((s) => toggleQbitAltSpeed(settings, s)))
        toast.success('Toggled alternative speed limit')
      }
      q.live.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setGlobalBusy(null)
    }
  }

  if (!q.hydrated) return <PageSkeleton variant="grid" rows={6} />

  const activeDownloads = counts.downloading ?? 0
  const canBlockConfirm = Boolean(
    confirmRemove &&
      (confirmRemove.service === 'sonarr' ||
        confirmRemove.service === 'radarr' ||
        confirmRemove.service === 'lidarr'),
  )

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        title="Queue"
        description={`${q.source.length} item${q.source.length === 1 ? '' : 's'}${
          q.live.updatedAt
            ? ` · updated ${new Date(q.live.updatedAt).toLocaleTimeString()}`
            : ''
        }`}
        actions={
          hasGlobalControls ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={globalBusy === 'pause'}
                onClick={() => void runGlobal('pause')}
              >
                <Pause className="size-3.5" aria-hidden />
                Pause all
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={globalBusy === 'resume'}
                onClick={() => void runGlobal('resume')}
              >
                <Play className="size-3.5" aria-hidden />
                Resume all
              </Button>
              {qbitServices.length > 0 ? (
                <Button
                  variant="soft"
                  size="sm"
                  loading={globalBusy === 'turtle'}
                  onClick={() => void runGlobal('turtle')}
                >
                  <Gauge className="size-3.5" aria-hidden />
                  Alt speed
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />

      {!q.canShowQueue ? (
        <EmptyState
          icon={<Download className="size-5" aria-hidden />}
          title="Nothing in the queue"
          description="Add a download client, Seerr, or Tautulli in Settings to monitor live activity."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => q.setFilter('downloading')}
              className={cn(
                'magnetic panel cursor-pointer rounded-[var(--radius-xl)] px-3.5 py-3 text-left transition-colors active:scale-[0.98]',
                q.filter === 'downloading' && 'border-[var(--color-success)]/50',
              )}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                <ArrowDown className="size-3 text-[var(--color-success)]" aria-hidden />
                <span>Throughput</span>
              </div>
              <p className="tabular mt-1.5 text-base font-semibold text-[var(--color-success)] sm:text-lg">
                <SpeedValue value={speed} />
              </p>
            </button>
            <button
              type="button"
              onClick={() => q.setFilter('downloading')}
              className={cn(
                'magnetic panel cursor-pointer rounded-[var(--radius-xl)] px-3.5 py-3 text-left transition-colors active:scale-[0.98]',
                q.filter === 'downloading' && 'border-[var(--color-primary)]/50',
              )}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                <Activity className="size-3 text-[var(--color-primary)]" aria-hidden />
                <span>Active</span>
              </div>
              <p className="tabular mt-1.5 text-base font-semibold text-[var(--color-foreground)] sm:text-lg">
                {activeDownloads}
              </p>
            </button>
            <button
              type="button"
              onClick={() => q.setFilter('all')}
              className={cn(
                'magnetic panel cursor-pointer rounded-[var(--radius-xl)] px-3.5 py-3 text-left transition-colors active:scale-[0.98]',
                q.filter === 'all' && 'border-[var(--color-warning)]/50',
              )}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                <Layers className="size-3 text-[var(--color-warning)]" aria-hidden />
                <span>Total</span>
              </div>
              <p className="tabular mt-1.5 text-base font-semibold text-[var(--color-foreground)] sm:text-lg">
                {q.source.length}
              </p>
            </button>
          </div>

          <QueueFilterBar
            filters={q.visibleFilters}
            value={q.filter}
            counts={counts}
            onChange={q.setFilter}
          />

          {!q.isDemo &&
          q.live.status === 'error' &&
          q.filter !== 'requests' &&
          q.filter !== 'watching' ? (
            <EmptyState title="Couldn’t load downloads" description={q.live.error} />
          ) : (
            <div className="grid grid-cols-1 gap-3 pb-2 md:grid-cols-2 xl:grid-cols-3">
              {q.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(index, 8) * 0.03,
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <QueueItemCard
                    item={item}
                    dense
                    onOpen={() => q.openItem(item)}
                    onPause={
                      item.canPause
                        ? () => void q.live.pauseOrResume(item, item.status === 'paused')
                        : undefined
                    }
                    onRemove={item.canRemove ? () => setConfirmRemove(item) : undefined}
                    onRetry={
                      item.status === 'request'
                        ? undefined
                        : item.canRetry
                          ? () => void q.live.retryItem(item)
                          : undefined
                    }
                    onApprove={
                      item.status === 'request' && item.canRetry
                        ? () => q.approveRequest(item)
                        : undefined
                    }
                    onDecline={
                      item.status === 'request' && item.canRetry
                        ? () => q.declineRequest(item)
                        : undefined
                    }
                  />
                </motion.div>
              ))}
              {q.items.length === 0 ? (
                <EmptyState
                  className="col-span-full"
                  title="Queue is empty"
                  description={
                    q.isDemo ? 'No jobs match this filter.' : 'Nothing in this lane right now.'
                  }
                />
              ) : null}
            </div>
          )}
        </>
      )}

      <p className="pb-2 text-center text-xs text-[var(--color-muted-foreground)]">
        Need another download client?{' '}
        <Link
          to="/settings?focus=services"
          className="font-semibold text-[var(--color-primary)] hover:underline"
        >
          Manage in Settings
        </Link>
      </p>

      <QueueItemSheet
        item={q.selected}
        onClose={() => q.setSelected(null)}
        onPause={
          q.selected?.canPause
            ? () => void q.live.pauseOrResume(q.selected!, q.selected!.status === 'paused')
            : undefined
        }
        onRemove={
          q.selected?.canRemove
            ? () => {
                const target = q.selected!
                q.setSelected(null)
                setConfirmRemove(target)
              }
            : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title="Remove from queue"
        description={
          confirmRemove
            ? `Remove “${confirmRemove.title}” from ${confirmRemove.service}?`
            : ''
        }
        confirmLabel="Remove"
        tone="danger"
        optionLabel={canBlockConfirm ? 'Also add release to blocklist' : undefined}
        optionDescription={
          canBlockConfirm
            ? 'Prevents *arr from automatically grabbing this same release again.'
            : undefined
        }
        onClose={() => setConfirmRemove(null)}
        onConfirm={(blocklist) => {
          if (confirmRemove) q.handleRemove(confirmRemove, canBlockConfirm && blocklist)
        }}
      />
    </div>
  )
}
