import { ReleasePickerSheet } from '@/features/title/ReleasePickerSheet'
import type { TitleEpisode } from '@/data/demoTitles'
import type { useTitleSearchActions } from '@/hooks/useTitleSearchActions'

interface TitleReleasePickersProps {
  pickerEpisode: TitleEpisode | null
  moviePickerOpen: boolean
  titleLabel: string
  search: ReturnType<typeof useTitleSearchActions>
  onCloseEpisode: () => void
  onCloseMovie: () => void
}

export function TitleReleasePickers({
  pickerEpisode,
  moviePickerOpen,
  titleLabel,
  search,
  onCloseEpisode,
  onCloseMovie,
}: TitleReleasePickersProps) {
  return (
    <>
      <ReleasePickerSheet
        open={Boolean(pickerEpisode)}
        title={
          pickerEpisode
            ? `E${String(pickerEpisode.episodeNumber).padStart(2, '0')} · ${pickerEpisode.title}`
            : 'Episode search'
        }
        onClose={onCloseEpisode}
        loadReleases={() => search.searchEpisodeReleases(Number(pickerEpisode?.id))}
        onGrab={search.grabRelease}
        onAutoSearch={
          pickerEpisode
            ? () => search.autoSearchEpisodes([Number(pickerEpisode.id)])
            : undefined
        }
      />
      <ReleasePickerSheet
        open={moviePickerOpen}
        title={`Search · ${titleLabel}`}
        onClose={onCloseMovie}
        loadReleases={
          search.parsed?.service === 'lidarr'
            ? search.searchAlbumReleases
            : search.searchMovieReleases
        }
        onGrab={search.grabRelease}
        onAutoSearch={
          search.parsed?.service === 'lidarr' ? search.autoSearchAlbum : search.autoSearchMovie
        }
      />
    </>
  )
}
