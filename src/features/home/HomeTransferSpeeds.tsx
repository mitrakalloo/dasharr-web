import { Link } from 'react-router-dom'
import { ArrowDown, ChevronRight } from 'lucide-react'

import { SpeedValue } from '@/components/ui/SpeedValue'
import { useAggregateDownloadSpeed } from '@/hooks/useAggregateDownloadSpeed'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'

export function HomeTransferSpeeds() {
  const { isDemo, hasAny } = useConfiguredStack()
  const speed = useAggregateDownloadSpeed()
  const show =
    isDemo ||
    hasAny('sabnzbd', 'qbittorrent', 'transmission', 'nzbget', 'deluge', 'sonarr', 'radarr')

  if (!show) return null

  return (
    <Link
      to="/queue"
      className="magnetic panel group flex items-center justify-between gap-4 rounded-[var(--radius-2xl)] px-4 py-3.5 active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-success)]/25 bg-[var(--color-success-muted)] text-[var(--color-success)]">
          <ArrowDown className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-sm font-semibold tracking-tight">Transfer speeds</h2>
          <p className="truncate text-xs text-[var(--color-muted-foreground)]">
            Aggregate download throughput · open queue
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <p className="tabular text-base font-semibold text-[var(--color-success)]">
          {speed > 0 ? (
            <SpeedValue value={speed} />
          ) : (
            <span className="text-sm text-[var(--color-muted-foreground)]">Idle</span>
          )}
        </p>
        <ChevronRight
          className="size-4 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
          aria-hidden
        />
      </div>
    </Link>
  )
}
