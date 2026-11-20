import { EmptyState } from '@/components/ui/EmptyState'
import type { TitleEpisode } from '@/data/demoTitles'
import { TitleEpisodeRow } from '@/features/title/TitleEpisodeRow'

interface TitleEpisodesProps {
  episodes: TitleEpisode[]
  canSearch?: boolean
  canToggleMonitor?: boolean
  onSearchEpisode?: (episode: TitleEpisode) => void
  onToggleEpisodeMonitor?: (episode: TitleEpisode) => void
}

export function TitleEpisodes({
  episodes,
  canSearch = false,
  canToggleMonitor = false,
  onSearchEpisode,
  onToggleEpisodeMonitor,
}: TitleEpisodesProps) {
  if (episodes.length === 0) {
    return (
      <EmptyState
        compact
        title="No episode breakdown"
        description="Episode details for this season haven’t synced yet."
      />
    )
  }

  return (
    <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
      {episodes.map((episode) => (
        <TitleEpisodeRow
          key={episode.id}
          episode={episode}
          canSearch={canSearch}
          canToggleMonitor={canToggleMonitor}
          onSearch={() => onSearchEpisode?.(episode)}
          onToggleMonitor={() => onToggleEpisodeMonitor?.(episode)}
        />
      ))}
    </div>
  )
}
