import { Bell, BellOff, Search } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import type { TitleEpisode } from '@/data/demoTitles'

interface TitleEpisodeRowProps {
  episode: TitleEpisode
  canSearch?: boolean
  canToggleMonitor?: boolean
  onSearch?: () => void
  onToggleMonitor?: () => void
}

export function TitleEpisodeRow({
  episode,
  canSearch = false,
  canToggleMonitor = false,
  onSearch,
  onToggleMonitor,
}: TitleEpisodeRowProps) {
  const statusTone = episode.hasFile
    ? 'success'
    : episode.monitored
      ? 'warning'
      : 'neutral'
  const statusLabel = episode.hasFile ? 'On disk' : episode.monitored ? 'Missing' : 'Off'

  return (
    <div className="flex min-h-16 items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[var(--color-hover)]">
      {canToggleMonitor ? (
        <IconButton
          size="sm"
          label={
            episode.monitored
              ? `Unmonitor E${episode.episodeNumber}`
              : `Monitor E${episode.episodeNumber}`
          }
          tone={episode.monitored ? 'primary' : 'default'}
          onClick={onToggleMonitor}
        >
          {episode.monitored ? <Bell className="size-3.5" /> : <BellOff className="size-3.5" />}
        </IconButton>
      ) : null}
      <span className="tabular w-8 shrink-0 font-mono text-xs font-semibold text-[var(--color-muted-foreground)]">
        E{String(episode.episodeNumber).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-foreground)]">
          {episode.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)] tabular">
          {episode.airDate}
          {episode.quality ? ` · ${episode.quality}` : ''}
          {episode.size ? ` · ${episode.size}` : ''}
        </p>
      </div>
      <Badge tone={statusTone} dot className="shrink-0">
        {statusLabel}
      </Badge>
      {canSearch ? (
        <IconButton
          size="sm"
          label={`Manual search E${episode.episodeNumber}`}
          tone="primary"
          onClick={onSearch}
        >
          <Search className="size-4" />
        </IconButton>
      ) : null}
    </div>
  )
}
