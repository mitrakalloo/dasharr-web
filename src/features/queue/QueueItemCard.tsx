import { Pause, Play, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SpeedValue } from '@/components/ui/SpeedValue'
import { SwipeableQueueRow } from '@/features/queue/SwipeableQueueRow'
import { useLiveSpeed } from '@/hooks/useLiveSpeed'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { parseSpeedMBps } from '@/lib/parseSpeed'
import { serviceAccent } from '@/lib/serviceColors'
import { cn } from '@/lib/cn'

interface QueueItemCardProps {
  item: DemoQueueItem
  onOpen: () => void
  onPause?: () => void
  onRemove?: () => void
  onRetry?: () => void
  onApprove?: () => void
  onDecline?: () => void
  dense?: boolean
}

export function QueueItemCard({
  item,
  onOpen,
  onPause,
  onRemove,
  onRetry,
  onApprove,
  onDecline,
  dense = false,
}: QueueItemCardProps) {
  const accent = serviceAccent(item.service)
  const live = item.status === 'downloading'
  const speed = useLiveSpeed(parseSpeedMBps(item.speed), live)
  const paused = item.status === 'paused'
  const showPause = Boolean(item.canPause && onPause)
  const showRemove = Boolean(item.canRemove && onRemove)
  const showRetry = Boolean(item.canRetry && onRetry)

  function handleRetry() {
    if (onRetry) onRetry()
    else toast.message('Force retry queued')
  }

  return (
    <SwipeableQueueRow
      paused={paused}
      onPauseToggle={showPause ? onPause : undefined}
      onRetry={showRetry ? handleRetry : item.canRetry ? handleRetry : undefined}
      onRemove={showRemove ? onRemove : undefined}
    >
      <article
        className={cn(
          'magnetic panel group rounded-2xl p-3 transition hover:bg-[var(--color-card-elevated)]',
          dense && 'p-2.5',
        )}
        style={{ ['--glow' as string]: accent }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full cursor-pointer gap-3 text-left transition active:scale-[0.97]"
        >
          <PosterThumb
            src={item.poster}
            label={item.title}
            accent={accent}
            className={cn('h-[72px] w-12 rounded-lg', dense && 'h-14 w-10')}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={accent}>{item.service}</Badge>
              <Badge>{item.quality}</Badge>
              {item.releaseGroup ? <Badge>{item.releaseGroup}</Badge> : null}
            </div>
            <h3 className="mt-1.5 truncate text-sm font-semibold">{item.title}</h3>
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">{item.subtitle}</p>
          </div>
        </button>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="tabular font-medium">{item.progress}%</span>
            <span className="tabular text-[var(--color-muted-foreground)]">
              {speed !== null && live ? <SpeedValue value={speed} /> : item.speed}
              {' · ETA '}
              {item.eta}
            </span>
          </div>
          <ProgressBar value={item.progress} color={accent} live={live} />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="tabular text-xs text-[var(--color-muted-foreground)]">{item.size}</p>
          {showPause || showRemove || item.canRetry || onApprove || onDecline ? (
            <div className="flex gap-1 opacity-100 lg:opacity-0 lg:transition lg:group-hover:opacity-100 lg:focus-within:opacity-100">
              {onApprove ? (
                <IconButton label="Approve request" tone="accent" onClick={onApprove}>
                  <span className="text-sm font-bold">✓</span>
                </IconButton>
              ) : null}
              {onDecline ? (
                <IconButton label="Decline request" tone="danger" onClick={onDecline}>
                  <span className="text-sm font-bold">✕</span>
                </IconButton>
              ) : null}
              {showPause ? (
                <IconButton
                  label={paused ? 'Resume download' : 'Pause download'}
                  onClick={onPause}
                >
                  {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </IconButton>
              ) : null}
              {item.canRetry && onRetry ? (
                <IconButton label="Force retry" onClick={handleRetry}>
                  <RotateCcw className="size-4" />
                </IconButton>
              ) : null}
              {showRemove ? (
                <IconButton label="Remove download" tone="danger" onClick={onRemove}>
                  <Trash2 className="size-4" />
                </IconButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </SwipeableQueueRow>
  )
}
