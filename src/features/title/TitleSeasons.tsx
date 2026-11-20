import { Bell, BellOff } from 'lucide-react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import type { TitleSeason } from '@/data/demoTitles'
import { cn } from '@/lib/cn'

interface TitleSeasonsProps {
  seasons: TitleSeason[]
  selected: number
  onSelect: (seasonNumber: number) => void
  onToggleSeasonMonitor?: (seasonNumber: number, nextMonitored: boolean) => void
}

export function TitleSeasons({
  seasons,
  selected,
  onSelect,
  onToggleSeasonMonitor,
}: TitleSeasonsProps) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Seasons" count={seasons.length} />
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {seasons.map((season) => {
          const active = season.seasonNumber === selected
          const ratio =
            season.episodeCount > 0
              ? Math.min(100, Math.round((season.episodeFileCount / season.episodeCount) * 100))
              : 0
          const isMonitored = season.monitored ?? true
          return (
            <div
              key={season.seasonNumber}
              className={cn(
                'relative flex min-h-[var(--tap)] min-w-[144px] shrink-0 flex-col rounded-[var(--radius-xl)] border px-3.5 py-2.5 text-left transition',
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--elevation-sm)]'
                  : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-hover)]',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(season.seasonNumber)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                >
                  <p className="text-sm font-semibold">
                    {season.seasonNumber === 0 ? 'Specials' : `Season ${season.seasonNumber}`}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 tabular text-xs',
                      active
                        ? 'text-[var(--color-primary-foreground)]/80'
                        : 'text-[var(--color-muted-foreground)]',
                    )}
                  >
                    {season.episodeFileCount}/{season.episodeCount}
                    {season.sizeOnDisk ? ` · ${season.sizeOnDisk}` : ''}
                  </p>
                </button>
                {onToggleSeasonMonitor ? (
                  <button
                    type="button"
                    aria-label={
                      isMonitored
                        ? `Unmonitor season ${season.seasonNumber}`
                        : `Monitor season ${season.seasonNumber}`
                    }
                    title={isMonitored ? 'Unmonitor season' : 'Monitor season'}
                    onClick={() => onToggleSeasonMonitor(season.seasonNumber, !isMonitored)}
                    className={cn(
                      'inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] transition-colors',
                      active
                        ? 'text-[var(--color-primary-foreground)]/85 hover:bg-white/15 hover:text-white'
                        : isMonitored
                          ? 'text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]'
                          : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)]',
                    )}
                  >
                    {isMonitored ? (
                      <Bell className="size-3.5" aria-hidden />
                    ) : (
                      <BellOff className="size-3.5" aria-hidden />
                    )}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => onSelect(season.seasonNumber)}
                className={cn(
                  'mt-2 h-1 w-full cursor-pointer overflow-hidden rounded-full',
                  active ? 'bg-black/20' : 'bg-[var(--color-track)]',
                )}
                aria-hidden="true"
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-300',
                    active ? 'bg-white' : 'bg-[var(--color-primary)]',
                  )}
                  style={{ width: `${ratio}%` }}
                />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
