import { TitleEpisodeRow } from '@/features/title/TitleEpisodeRow'
import type { TitleEpisode } from '@/data/demoTitles'

interface TitleEpisodesProps {
  episodes: TitleEpisode[]
  canSearch?: boolean
  onSearchEpisode?: (episode: TitleEpisode) => void
}

export function TitleEpisodes({
  episodes,
  canSearch = false,
  onSearchEpisode,
}: TitleEpisodesProps) {
  if (episodes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
        No episode breakdown for this season yet.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
      {episodes.map((episode, index) => (
        <TitleEpisodeRow
          key={episode.id}
          episode={episode}
          bordered={index < episodes.length - 1}
          canSearch={canSearch}
          onSearch={() => onSearchEpisode?.(episode)}
        />
      ))}
    </div>
  )
}
