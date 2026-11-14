import { BottomSheet } from '@/components/ui/BottomSheet'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { serviceAccent } from '@/lib/serviceColors'

interface QueueItemSheetProps {
  item: DemoQueueItem | null
  onClose: () => void
  onPause?: () => void
  onRemove?: () => void
}

export function QueueItemSheet({ item, onClose, onPause, onRemove }: QueueItemSheetProps) {
  const accent = item ? serviceAccent(item.service) : undefined
  const paused = item?.status === 'paused'
  const showPause = Boolean(item?.canPause && onPause)
  const showRemove = Boolean(item?.canRemove && onRemove)

  return (
    <BottomSheet
      open={Boolean(item)}
      onClose={onClose}
      title={item?.title ?? 'Download'}
      desktop="drawer"
    >
      {item ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <PosterThumb
              src={item.poster}
              label={item.title}
              accent={accent ?? '#38bdf8'}
              className="h-28 w-20 rounded-xl"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge color={accent}>{item.service}</Badge>
                <Badge>{item.quality}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{item.subtitle}</p>
              <p className="mt-2 tabular text-xs text-[var(--color-muted-foreground)]">
                {item.size} · {item.speed}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="tabular font-medium">{item.progress}%</span>
              <span className="tabular text-[var(--color-muted-foreground)]">ETA {item.eta}</span>
            </div>
            <ProgressBar
              value={item.progress}
              color={accent}
              live={item.status === 'downloading'}
            />
          </div>

          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            {item.overview}
          </p>

          {item.indexers.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Indexer grabs</h3>
              <div className="space-y-2">
                {item.indexers.map((indexer) => (
                  <div
                    key={indexer.name}
                    className="flex min-h-[var(--tap)] items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{indexer.name}</p>
                      <p className="tabular text-xs text-[var(--color-muted-foreground)]">
                        {indexer.size}
                        {indexer.seeders ? ` · ${indexer.seeders} seeders` : ''} · score{' '}
                        {indexer.score}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {showPause || showRemove ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {showPause ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    onPause?.()
                    onClose()
                  }}
                >
                  {paused ? 'Resume' : 'Pause'}
                </Button>
              ) : (
                <div />
              )}
              {showRemove ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    onRemove?.()
                    onClose()
                  }}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Pause/remove only apply to download-client queue items. *arr rows can be removed from
              the *arr queue.
            </p>
          )}
        </div>
      ) : null}
    </BottomSheet>
  )
}
