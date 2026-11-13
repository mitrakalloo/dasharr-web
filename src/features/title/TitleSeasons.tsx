import type { TitleSeason } from '@/data/demoTitles'
import { cn } from '@/lib/cn'

interface TitleSeasonsProps {
  seasons: TitleSeason[]
  selected: number
  onSelect: (seasonNumber: number) => void
}

export function TitleSeasons({ seasons, selected, onSelect }: TitleSeasonsProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Seasons</h2>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {seasons.map((season) => {
          const active = season.seasonNumber === selected
          return (
            <button
              key={season.seasonNumber}
              type="button"
              onClick={() => onSelect(season.seasonNumber)}
              className={cn(
                'min-h-[var(--tap)] shrink-0 cursor-pointer rounded-2xl border px-4 py-2 text-left transition active:scale-95',
                active
                  ? 'border-white bg-white text-black'
                  : 'border-[var(--color-border)] bg-[var(--color-card)]',
              )}
            >
              <p className="text-sm font-semibold">Season {season.seasonNumber}</p>
              <p
                className={cn(
                  'tabular text-xs',
                  active ? 'text-black/65' : 'text-[var(--color-muted-foreground)]',
                )}
              >
                {season.episodeFileCount}/{season.episodeCount} · {season.sizeOnDisk}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
