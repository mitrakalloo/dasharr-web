import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ReleasePickerSheet } from '@/features/title/ReleasePickerSheet'
import { TitleDetailActions } from '@/features/title/TitleDetailActions'
import { TitleEpisodes } from '@/features/title/TitleEpisodes'
import { TitleHero } from '@/features/title/TitleHero'
import { TitleHeroBar } from '@/features/title/TitleHeroBar'
import { TitleMetaBadges } from '@/features/title/TitleMetaBadges'
import { TitleOverview } from '@/features/title/TitleOverview'
import { TitleReleases } from '@/features/title/TitleReleases'
import { TitleSeasons } from '@/features/title/TitleSeasons'
import { useTitleScroll } from '@/features/title/useTitleScroll'
import type { TitleEpisode } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useTitleDetail } from '@/hooks/useTitleDetail'
import { useTitleSearchActions } from '@/hooks/useTitleSearchActions'

export function TitleDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { isDemo } = useConfiguredStack()
  const detail = useTitleDetail(id, isDemo)
  const search = useTitleSearchActions(id)
  const { rootRef, scrollY } = useTitleScroll()
  const [monitored, setMonitored] = useState(false)
  const [seasonNumber, setSeasonNumber] = useState(1)
  const [pickerEpisode, setPickerEpisode] = useState<TitleEpisode | null>(null)
  const [moviePickerOpen, setMoviePickerOpen] = useState(false)

  useEffect(() => {
    if (detail.status !== 'success') return
    setMonitored(detail.data.monitored)
    setSeasonNumber(
      detail.data.seasons?.find((season) => season.episodes.length > 0)?.seasonNumber ??
        detail.data.seasons?.[0]?.seasonNumber ??
        1,
    )
  }, [detail])

  if (detail.status === 'loading' || detail.status === 'idle') {
    return <div className="px-4 py-10 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  if (detail.status === 'error' || !detail.data) {
    return (
      <div className="space-y-4 px-4 py-10 text-center">
        <h1 className="text-xl font-semibold">Title not found</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {detail.status === 'error' ? detail.error : 'This title isn’t available.'}
        </p>
        <Link to="/" className="inline-flex min-h-10 items-center text-sm text-sky-300">
          Back home
        </Link>
      </div>
    )
  }

  const title = { ...detail.data, monitored }
  const season = title.seasons?.find((item) => item.seasonNumber === seasonNumber)
  const liveSearch = !isDemo && search.canSearch

  return (
    <div ref={rootRef} className="pb-10">
      <TitleHeroBar
        title={title.title}
        monitored={title.monitored}
        scrollY={scrollY}
        onBack={() => navigate(-1)}
        onToggleMonitor={() => {
          setMonitored((prev) => !prev)
          toast.message(monitored ? 'Unmonitored (local)' : 'Monitored (local)')
        }}
      />
      <TitleHero title={title} scrollY={scrollY} />

      <div className="space-y-6 px-4 pt-4">
        <TitleMetaBadges title={title} />
        <TitleOverview overview={title.overview} path={title.path} />
        <TitleDetailActions
          kind={title.kind}
          liveSearch={liveSearch}
          isDemo={isDemo}
          onManualSearch={() => setMoviePickerOpen(true)}
          onAutoSearch={() => {
            const run =
              title.kind === 'movie'
                ? search.autoSearchMovie()
                : search.autoSearchSeason(seasonNumber)
            void run.catch((err: unknown) =>
              toast.error(err instanceof Error ? err.message : 'Auto-search failed'),
            )
          }}
        />

        {title.kind === 'series' && title.seasons ? (
          <>
            <TitleSeasons
              seasons={title.seasons}
              selected={seasonNumber}
              onSelect={setSeasonNumber}
            />
            <TitleEpisodes
              episodes={season?.episodes ?? []}
              canSearch={liveSearch && search.parsed?.service === 'sonarr'}
              onSearchEpisode={setPickerEpisode}
            />
          </>
        ) : null}

        {title.releases.length > 0 ? <TitleReleases releases={title.releases} /> : null}
      </div>

      <ReleasePickerSheet
        open={Boolean(pickerEpisode)}
        title={
          pickerEpisode
            ? `E${String(pickerEpisode.episodeNumber).padStart(2, '0')} · ${pickerEpisode.title}`
            : 'Episode search'
        }
        onClose={() => setPickerEpisode(null)}
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
        title={`Search · ${title.title}`}
        onClose={() => setMoviePickerOpen(false)}
        loadReleases={search.searchMovieReleases}
        onGrab={search.grabRelease}
        onAutoSearch={search.autoSearchMovie}
      />
    </div>
  )
}
