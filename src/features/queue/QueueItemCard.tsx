import { Pause, Play, Trash2 } from 'lucide-react'
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

interface QueueItemCardProps {
  item: DemoQueueItem
  onOpen: () => void
  onPause?: () => void
}

export function QueueItemCard({ item, onOpen, onPause }: QueueItemCardProps) {
  const accent = serviceAccent(item.service)
  const live = item.status === 'downloading'
  const speed = useLiveSpeed(parseSpeedMBps(item.speed), live)
  const paused = item.status === 'paused'

  return (
    <SwipeableQueueRow
      paused={paused}
      onPauseToggle={item.canPause ? onPause : undefined}
      onRemove={() => toast.message('Remove isn’t wired for this client yet')}
    >
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full cursor-pointer gap-3 text-left transition active:scale-[0.99]"
        >
          <PosterThumb
            src={item.poster}
            label={item.title}
            accent={accent}
            className="h-[72px] w-12 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={accent}>{item.service}</Badge>
              <Badge>{item.quality}</Badge>
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
          <div className="flex gap-1">
            <IconButton
              label={paused ? 'Resume download' : 'Pause download'}
              onClick={() => {
                if (item.canPause && onPause) onPause()
                else toast.message(paused ? 'Resumed' : 'Paused')
              }}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </IconButton>
            <IconButton
              label="Remove download"
              tone="danger"
              onClick={() => toast.message('Remove isn’t wired for this client yet')}
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        </div>
      </article>
    </SwipeableQueueRow>
  )
}
