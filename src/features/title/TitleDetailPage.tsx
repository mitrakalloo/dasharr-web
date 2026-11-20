import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Film } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import type { TitleEpisode } from '@/data/demoTitles'
import { TitleDetailActions } from '@/features/title/TitleDetailActions'
import { TitleEditSheet } from '@/features/title/TitleEditSheet'
import { TitleEpisodes } from '@/features/title/TitleEpisodes'
import { TitleHero } from '@/features/title/TitleHero'
import { TitleHeroBar } from '@/features/title/TitleHeroBar'
import { TitleMetaBadges } from '@/features/title/TitleMetaBadges'
import { TitleOverview } from '@/features/title/TitleOverview'
import { TitleReleasePickers } from '@/features/title/TitleReleasePickers'
import { TitleReleases } from '@/features/title/TitleReleases'
import { TitleSeasons } from '@/features/title/TitleSeasons'
import { useTitleScroll } from '@/features/title/useTitleScroll'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useMonitorTitle } from '@/hooks/useMonitorTitle'
import { useTitleDetail } from '@/hooks/useTitleDetail'
import { useTitleManage } from '@/hooks/useTitleManage'
import { useTitleSearchActions } from '@/hooks/useTitleSearchActions'
import { parseLiveTitleId } from '@/lib/liveTitleId'
import {
  getSonarrSeriesById,
  updateSonarrEpisodeMonitored,
  updateSonarrSeries,
} from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

export function TitleDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { isDemo } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const detail = useTitleDetail(id, isDemo)
  const search = useTitleSearchActions(id)
  const manage = useTitleManage(id)
  const monitor = useMonitorTitle(id)
  const { rootRef, scrollY } = useTitleScroll()
  const [monitored, setMonitored] = useState(false)
  const [seasonNumber, setSeasonNumber] = useState(1)
  const [pickerEpisode, setPickerEpisode] = useState<TitleEpisode | null>(null)
  const [moviePickerOpen, setMoviePickerOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (detail.status !== 'success') return
    setMonitored(detail.data.monitored)
    setSeasonNumber((prev) => {
      if (detail.data.seasons?.some((s) => s.seasonNumber === prev)) return prev
      return (
        detail.data.seasons?.find((season) => season.episodes.length > 0)?.seasonNumber ??
        detail.data.seasons?.[0]?.seasonNumber ??
        1
      )
    })
  }, [detail])

  if (detail.status === 'loading' || detail.status === 'idle') {
    return <PageSkeleton variant="detail" />
  }

  if (detail.status === 'error' || !detail.data) {
    return (
      <div className="page-pad">
        <EmptyState
          icon={<Film className="size-5" aria-hidden="true" />}
          title="Title not found"
          description={detail.status === 'error' ? detail.error : 'This title isn’t available.'}
          actionLabel="Back to home"
          actionTo="/"
        />
      </div>
    )
  }

  const parsed = parseLiveTitleId(id)
  const sonarrService =
    parsed?.service === 'sonarr'
      ? services.find((s) => s.enabled && s.type === 'sonarr')
      : undefined
  const canEdit =
    !isDemo &&
    manage.canManage &&
    (parsed?.service === 'sonarr' || parsed?.service === 'radarr')

  async function handleToggleSeasonMonitor(targetSeason: number, nextMonitored: boolean) {
    if (!sonarrService || !parsed) return
    try {
      const current = await getSonarrSeriesById(settings, sonarrService, parsed.numericId)
      const nextSeasons = (current.seasons ?? []).map((s) =>
        s.seasonNumber === targetSeason ? { ...s, monitored: nextMonitored } : s,
      )
      await updateSonarrSeries(settings, sonarrService, { ...current, seasons: nextSeasons })
      toast.success(
        `Season ${targetSeason} ${nextMonitored ? 'monitored' : 'unmonitored'}`,
      )
      detail.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update season')
    }
  }

  async function handleToggleEpisodeMonitor(episode: TitleEpisode) {
    if (!sonarrService) return
    const episodeId = Number(episode.id)
    if (!Number.isFinite(episodeId)) return
    const next = !episode.monitored
    try {
      await updateSonarrEpisodeMonitored(settings, sonarrService, [episodeId], next)
      toast.success(
        `E${String(episode.episodeNumber).padStart(2, '0')} ${next ? 'monitored' : 'unmonitored'}`,
      )
      detail.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update episode')
    }
  }

  const title = { ...detail.data, monitored }
  const season = title.seasons?.find((item) => item.seasonNumber === seasonNumber)
  const liveSearch = !isDemo && search.canSearch
  const hasSecondaryColumn =
    (title.kind === 'series' && Boolean(title.seasons?.length)) || title.releases.length > 0

  return (
    <div ref={rootRef} className="pb-12">
      <TitleHeroBar
        title={title.title}
        monitored={title.monitored}
        scrollY={scrollY}
        onBack={() => navigate(-1)}
        onToggleMonitor={() => {
          const next = !monitored
          setMonitored(next)
          if (isDemo || !monitor.canSync) {
            toast.message(next ? 'Monitored (local)' : 'Unmonitored (local)')
            return
          }
          void monitor.setMonitored(next).then((ok) => {
            if (!ok) setMonitored(!next)
          })
        }}
      />
      <TitleHero title={title} scrollY={scrollY} />

      <div className="page-pad">
        <div
          className={
            hasSecondaryColumn
              ? 'grid grid-cols-1 gap-6 lg:grid-cols-12'
              : 'mx-auto max-w-3xl space-y-5'
          }
        >
          <div className={hasSecondaryColumn ? 'space-y-5 lg:col-span-5' : 'space-y-5'}>
            <TitleMetaBadges title={title} />
            <TitleOverview overview={title.overview} path={title.path} />
            <TitleDetailActions
              kind={title.kind}
              liveSearch={liveSearch}
              isDemo={isDemo}
              canManage={!isDemo && manage.canManage}
              canEdit={canEdit}
              onEdit={() => setEditOpen(true)}
              onManualSearch={() => setMoviePickerOpen(true)}
              onAutoSearch={() => {
                const run =
                  search.parsed?.service === 'lidarr'
                    ? search.autoSearchAlbum()
                    : title.kind === 'movie'
                      ? search.autoSearchMovie()
                      : search.autoSearchSeason(seasonNumber)
                void run.catch((err: unknown) =>
                  toast.error(err instanceof Error ? err.message : 'Auto-search failed'),
                )
              }}
              onRefresh={() => void manage.refreshMetadata()}
              onDelete={(deleteFiles) => void manage.deleteFromLibrary(deleteFiles)}
            />
          </div>

          {hasSecondaryColumn ? (
            <div className="space-y-6 lg:col-span-7">
              {title.kind === 'series' && title.seasons ? (
                <>
                  <TitleSeasons
                    seasons={title.seasons}
                    selected={seasonNumber}
                    onSelect={setSeasonNumber}
                    onToggleSeasonMonitor={
                      !isDemo && sonarrService
                        ? (sn, next) => void handleToggleSeasonMonitor(sn, next)
                        : undefined
                    }
                  />
                  <TitleEpisodes
                    episodes={season?.episodes ?? []}
                    canSearch={liveSearch && search.parsed?.service === 'sonarr'}
                    canToggleMonitor={!isDemo && Boolean(sonarrService)}
                    onSearchEpisode={setPickerEpisode}
                    onToggleEpisodeMonitor={(ep) => void handleToggleEpisodeMonitor(ep)}
                  />
                </>
              ) : null}

              {title.releases.length > 0 ? <TitleReleases releases={title.releases} /> : null}
            </div>
          ) : null}
        </div>
      </div>

      <TitleReleasePickers
        pickerEpisode={pickerEpisode}
        moviePickerOpen={moviePickerOpen}
        titleLabel={title.title}
        search={search}
        onCloseEpisode={() => setPickerEpisode(null)}
        onCloseMovie={() => setMoviePickerOpen(false)}
      />

      {canEdit ? (
        <TitleEditSheet
          open={editOpen}
          titleId={id}
          titleName={title.title}
          onClose={() => setEditOpen(false)}
          onSaved={detail.reload}
        />
      ) : null}
    </div>
  )
}
