import { Search } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import type { TitleEpisode } from '@/data/demoTitles'
import { cn } from '@/lib/cn'

interface TitleEpisodeRowProps {
  episode: TitleEpisode
  bordered?: boolean
  canSearch?: boolean
  onSearch?: () => void
}

export function TitleEpisodeRow({
  episode,
  bordered = false,
  canSearch = false,
  onSearch,
}: TitleEpisodeRowProps) {
  return (
    <div
      className={cn(
        'flex min-h-16 items-center gap-2 px-3 py-2',
        bordered && 'border-b border-[var(--color-border)]',
      )}
    >
      <span className="tabular w-8 shrink-0 text-sm font-semibold text-[var(--color-muted-foreground)]">
        E{String(episode.episodeNumber).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{episode.title}</p>
        <p className="truncate text-xs text-[var(--color-muted-foreground)]">
          {episode.airDate}
          {episode.quality ? ` · ${episode.quality}` : ''}
          {episode.size ? ` · ${episode.size}` : ''}
        </p>
      </div>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[11px] font-medium',
          episode.hasFile
            ? 'bg-emerald-500/15 text-emerald-300'
            : episode.monitored
              ? 'bg-amber-500/15 text-amber-300'
              : 'bg-white/5 text-[var(--color-muted-foreground)]',
        )}
      >
        {episode.hasFile ? 'On disk' : episode.monitored ? 'Missing' : 'Off'}
      </span>
      {canSearch ? (
        <IconButton label={`Manual search E${episode.episodeNumber}`} tone="accent" onClick={onSearch}>
          <Search className="size-4" />
        </IconButton>
      ) : null}
    </div>
  )
}
