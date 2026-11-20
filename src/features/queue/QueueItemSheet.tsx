import { Link } from 'react-router-dom'
import { ArrowUpRight, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { DemoQueueItem } from '@/data/demoDashboard'
import { serviceAccent } from '@/lib/serviceColors'
import { titlePath } from '@/data/demoTitles'
import { useConfigStore } from '@/stores/configStore'

interface QueueItemSheetProps {
  item: DemoQueueItem | null
  onClose: () => void
  onPause?: () => void
  onRemove?: () => void
}

export function QueueItemSheet({ item, onClose, onPause, onRemove }: QueueItemSheetProps) {
  const services = useConfigStore((state) => state.services)
  const matchedService = item
    ? services.find((service) => service.enabled && service.type === item.service)
    : undefined
  const accent = item ? serviceAccent(item.service) : undefined
  const paused = item?.status === 'paused'
  const showPause = Boolean(item?.canPause && onPause)
  const showRemove = Boolean(item?.canRemove && onRemove)

  return (
    <BottomSheet
      open={Boolean(item)}
      onClose={onClose}
      title={item?.title ?? 'Download'}
      subtitle={item ? `${item.service} · ${item.quality}` : undefined}
      desktop="drawer"
    >
      {item ? (
        <div className="space-y-5">
          <div className="flex gap-3.5">
            <PosterThumb
              src={item.poster}
              label={item.title}
              accent={accent ?? '#38bdf8'}
              className="h-28 w-20"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1.5">
                {matchedService ? (
                  <Link to={`/service/${matchedService.id}`} onClick={onClose}>
                    <Badge color={accent} className="cursor-pointer hover:opacity-85">
                      {item.service}
                      <ArrowUpRight className="ml-0.5 inline size-3" aria-hidden />
                    </Badge>
                  </Link>
                ) : (
                  <Badge color={accent}>{item.service}</Badge>
                )}
                <Badge>{item.quality}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{item.subtitle}</p>
              <p className="mt-2 tabular text-xs text-[var(--color-muted-foreground)]">
                {item.size} · {item.speed}
              </p>
            </div>
          </div>

          {item.titleId ? (
            <Link to={titlePath(item.titleId)} onClick={onClose} className="block">
              <Button variant="soft" className="w-full">
                Open title details
                <ExternalLink className="size-4" aria-hidden />
              </Button>
            </Link>
          ) : null}

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] p-3.5">
            <div className="mb-2 flex justify-between text-xs">
              <span className="tabular font-semibold">{item.progress}%</span>
              <span className="tabular text-[var(--color-muted-foreground)]">ETA {item.eta}</span>
            </div>
            <ProgressBar
              value={item.progress}
              color={accent}
              live={item.status === 'downloading'}
            />
          </div>

          {item.overview ? (
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              {item.overview}
            </p>
          ) : null}

          {item.indexers.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-display text-sm font-semibold tracking-tight">Indexer grabs</h3>
              <div className="space-y-2">
                {item.indexers.map((indexer) => (
                  <Link
                    key={indexer.name}
                    to="/indexers"
                    onClick={onClose}
                    className="flex min-h-[var(--tap)] items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3.5 py-2 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)]"
                  >
                    <div>
                      <p className="text-sm font-medium">{indexer.name}</p>
                      <p className="tabular text-xs text-[var(--color-muted-foreground)]">
                        {indexer.size}
                        {indexer.seeders ? ` · ${indexer.seeders} seeders` : ''} · score{' '}
                        {indexer.score}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-[var(--color-muted-foreground)]" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {showPause || showRemove ? (
            <div className={showPause && showRemove ? 'grid grid-cols-2 gap-2.5 pt-1' : 'pt-1'}>
              {showPause ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    onPause?.()
                    onClose()
                  }}
                >
                  {paused ? 'Resume' : 'Pause'}
                </Button>
              ) : null}
              {showRemove ? (
                <Button
                  variant="danger"
                  className="w-full"
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
              Pause and remove controls apply to active download-client queue items.
            </p>
          )}
        </div>
      ) : null}
    </BottomSheet>
  )
}
