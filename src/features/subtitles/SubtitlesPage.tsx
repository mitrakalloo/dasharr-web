import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Captions, ChevronRight, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { liveTitleId } from '@/lib/liveTitleId'
import {
  getBazarrWantedEpisodes,
  getBazarrWantedMovies,
  searchBazarrEpisodeSubtitle,
  searchBazarrMovieSubtitle,
  type BazarrMissingLanguage,
  type BazarrWantedItem,
} from '@/lib/services/bazarr'
import { titlePath } from '@/data/demoTitles'
import { useConfigStore } from '@/stores/configStore'

type SubtitlesTab = 'episodes' | 'movies'

export function SubtitlesPage() {
  const { hydrated, has } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const bazarr = useConfigStore((state) =>
    state.services.find((s) => s.enabled && s.type === 'bazarr'),
  )

  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab')
  const tab: SubtitlesTab = tabParam === 'movies' ? 'movies' : 'episodes'
  const query = params.get('q') ?? ''

  const [episodes, setEpisodes] = useState<BazarrWantedItem[]>([])
  const [movies, setMovies] = useState<BazarrWantedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchingKey, setSearchingKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!bazarr) return
    setLoading(true)
    setError('')
    try {
      const [epList, mvList] = await Promise.all([
        getBazarrWantedEpisodes(settings, bazarr),
        getBazarrWantedMovies(settings, bazarr),
      ])
      setEpisodes(epList)
      setMovies(mvList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Bazarr wanted subtitles')
    } finally {
      setLoading(false)
    }
  }, [bazarr, settings])

  useEffect(() => {
    void load()
  }, [load])

  function setTab(next: SubtitlesTab) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  function setQuery(next: string) {
    const nextParams = new URLSearchParams(params)
    if (next) nextParams.set('q', next)
    else nextParams.delete('q')
    setParams(nextParams, { replace: true })
  }

  async function triggerSearch(item: BazarrWantedItem, lang: BazarrMissingLanguage, key: string) {
    if (!bazarr) return
    const code = lang.code2 ?? lang.code3 ?? 'en'
    setSearchingKey(key)
    try {
      if (tab === 'episodes' && item.sonarrSeriesId && item.sonarrEpisodeId) {
        await searchBazarrEpisodeSubtitle(settings, bazarr, {
          seriesId: item.sonarrSeriesId,
          episodeId: item.sonarrEpisodeId,
          language: code,
          forced: lang.forced,
          hi: lang.hi,
        })
        toast.success(`Searching ${lang.name ?? code.toUpperCase()} subtitles for ${item.seriesTitle ?? item.title}`)
      } else if (tab === 'movies' && item.radarrId) {
        await searchBazarrMovieSubtitle(settings, bazarr, {
          radarrId: item.radarrId,
          language: code,
          forced: lang.forced,
          hi: lang.hi,
        })
        toast.success(`Searching ${lang.name ?? code.toUpperCase()} subtitles for ${item.title}`)
      } else {
        toast.error('Missing upstream ID for subtitle search')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Subtitle search failed')
    } finally {
      setSearchingKey(null)
    }
  }

  const list = useMemo(() => {
    const source = tab === 'episodes' ? episodes : movies
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter((item) => {
      const hay = `${item.seriesTitle ?? ''} ${item.title ?? ''} ${item.episode_number ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [episodes, movies, query, tab])

  if (!hydrated) return <PageSkeleton variant="list" />

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        eyebrow="Bazarr"
        title="Subtitles"
        description={
          bazarr
            ? `${episodes.length} wanted episodes · ${movies.length} wanted movies`
            : 'Missing subtitle queue and one-tap search'
        }
        actions={
          bazarr ? (
            <Button variant="secondary" size="sm" loading={loading} onClick={() => void load()}>
              <RefreshCw className="size-3.5" aria-hidden />
              Refresh
            </Button>
          ) : undefined
        }
      />

      {!has('bazarr') || !bazarr ? (
        <EmptyState
          icon={<Captions className="size-5" aria-hidden />}
          title="Connect Bazarr"
          description="Add Bazarr in Settings to inspect missing subtitles and trigger searches with one tap."
          actionLabel="Open Settings"
          actionTo="/settings?focus=services"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SegmentedControl
              ariaLabel="Subtitle media type"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'episodes', label: `Episodes (${episodes.length})` },
                { value: 'movies', label: `Movies (${movies.length})` },
              ]}
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter missing subtitles…"
              leadingIcon={<Search className="size-4" aria-hidden />}
              wrapperClassName="flex-1"
            />
          </div>

          {error ? (
            <EmptyState
              title="Couldn’t load subtitles"
              description={error}
              actionLabel="Retry"
              onAction={() => void load()}
            />
          ) : loading && list.length === 0 ? (
            <div className="space-y-2.5">
              <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
              <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
              <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<Captions className="size-5" aria-hidden />}
              title="All caught up"
              description={
                query
                  ? 'No missing subtitles match your filter.'
                  : `No wanted ${tab} subtitles reported by Bazarr.`
              }
            />
          ) : (
            <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
              {list.map((item, idx) => {
                const targetPath =
                  tab === 'episodes' && item.sonarrSeriesId
                    ? titlePath(liveTitleId('sonarr', item.sonarrSeriesId))
                    : tab === 'movies' && item.radarrId
                      ? titlePath(liveTitleId('radarr', item.radarrId))
                      : undefined
                const langs = item.missing_subtitles ?? []

                return (
                  <div
                    key={`${item.sonarrEpisodeId ?? item.radarrId ?? idx}-${idx}`}
                    className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      {targetPath ? (
                        <Link
                          to={targetPath}
                          className="group inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
                        >
                          <span className="truncate">
                            {tab === 'episodes'
                              ? item.seriesTitle || item.title || 'Series'
                              : item.title || 'Movie'}
                          </span>
                          <ChevronRight className="size-3.5 shrink-0 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" />
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-semibold">
                          {tab === 'episodes'
                            ? item.seriesTitle || item.title || 'Series'
                            : item.title || 'Movie'}
                        </p>
                      )}
                      {tab === 'episodes' ? (
                        <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
                          {item.episode_number ? `${item.episode_number} · ` : ''}
                          {item.title ?? 'Episode'}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {langs.length === 0 ? (
                        <Badge tone="neutral">Missing</Badge>
                      ) : (
                        langs.map((lang, lIdx) => {
                          const code = (lang.code2 ?? lang.code3 ?? 'sub').toUpperCase()
                          const key = `${item.sonarrEpisodeId ?? item.radarrId ?? idx}-${code}-${lIdx}`
                          return (
                            <Button
                              key={key}
                              size="sm"
                              variant="soft"
                              loading={searchingKey === key}
                              onClick={() => void triggerSearch(item, lang, key)}
                            >
                              <Search className="size-3" aria-hidden />
                              {lang.name ?? code}
                              {lang.forced ? ' (Forced)' : ''}
                              {lang.hi ? ' (HI)' : ''}
                            </Button>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
