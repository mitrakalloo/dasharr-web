import { Check, Pause, Play, RotateCcw, Trash2, X } from 'lucide-react'

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
  onOpen?: () => void
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

  return (
    <SwipeableQueueRow
      paused={paused}
      onPauseToggle={showPause ? onPause : undefined}
      onRetry={showRetry ? onRetry : undefined}
      onRemove={showRemove ? onRemove : undefined}
    >
      <article
        className={cn(
          'magnetic panel group rounded-[var(--radius-2xl)] p-3.5 hover:bg-[var(--color-card-elevated)]',
          dense && 'p-3',
        )}
        style={{ ['--glow' as string]: accent }}
      >
        <button
          type="button"
          onClick={onOpen}
          disabled={!onOpen}
          className={cn(
            'flex w-full gap-3 text-left transition',
            onOpen ? 'cursor-pointer active:scale-[0.985]' : 'cursor-default',
          )}
        >
          <PosterThumb
            src={item.poster}
            label={item.title}
            accent={accent}
            className={cn('h-[74px] w-12', dense && 'h-14 w-10')}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge color={accent}>{item.service}</Badge>
              <Badge>{item.quality}</Badge>
              {item.releaseGroup ? <Badge>{item.releaseGroup}</Badge> : null}
            </div>
            <h3 className="mt-1.5 truncate text-sm font-semibold tracking-tight">{item.title}</h3>
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">{item.subtitle}</p>
          </div>
        </button>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="tabular font-semibold text-[var(--color-foreground)]">
              {item.progress}%
            </span>
            <span className="tabular truncate text-[var(--color-muted-foreground)]">
              {speed !== null && live ? <SpeedValue value={speed} /> : item.speed}
              {' · ETA '}
              {item.eta}
            </span>
          </div>
          <ProgressBar value={item.progress} color={accent} live={live} />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="tabular text-xs text-[var(--color-muted-foreground)]">{item.size}</p>
          {showPause || showRemove || showRetry || onApprove || onDecline ? (
            <div className="flex items-center gap-0.5 lg:opacity-80 lg:transition-opacity lg:group-hover:opacity-100 lg:focus-within:opacity-100">
              {onApprove ? (
                <IconButton label="Approve request" tone="success" size="sm" onClick={onApprove}>
                  <Check className="size-4" />
                </IconButton>
              ) : null}
              {onDecline ? (
                <IconButton label="Decline request" tone="danger" size="sm" onClick={onDecline}>
                  <X className="size-4" />
                </IconButton>
              ) : null}
              {showPause ? (
                <IconButton
                  label={paused ? 'Resume download' : 'Pause download'}
                  size="sm"
                  onClick={onPause}
                >
                  {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </IconButton>
              ) : null}
              {showRetry ? (
                <IconButton label="Force retry" size="sm" onClick={onRetry}>
                  <RotateCcw className="size-4" />
                </IconButton>
              ) : null}
              {showRemove ? (
                <IconButton label="Remove download" tone="danger" size="sm" onClick={onRemove}>
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
