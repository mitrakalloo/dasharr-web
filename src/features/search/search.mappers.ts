import type { MediaSearchItem } from '@/hooks/useMediaSearch'
import { liveTitleId } from '@/lib/liveTitleId'
import type { RadarrMovie } from '@/lib/services/radarr'
import { radarrPosterUrl } from '@/lib/services/radarr'
import type { SeerrSearchResult } from '@/lib/services/seerr'
import type { SonarrSeries } from '@/lib/services/sonarr'
import { sonarrPosterUrl } from '@/lib/services/sonarr'

function tmdbPoster(path?: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w185${path}`
}

export function mapSeerrResult(item: SeerrSearchResult): MediaSearchItem {
  const title = item.title ?? item.name ?? item.originalTitle ?? item.originalName ?? 'Untitled'
  const date = item.releaseDate ?? item.firstAirDate
  return {
    id: `seerr-${item.mediaType}-${item.id}`,
    title,
    year: date ? Number(date.slice(0, 4)) || 0 : 0,
    type: item.mediaType === 'tv' ? 'series' : 'movie',
    rating: item.voteAverage ?? 0,
    poster: tmdbPoster(item.posterPath),
    overview: item.overview ?? '',
    source: 'seerr',
    tmdbId: item.id,
    alreadyAdded: Boolean(item.mediaInfo),
  }
}

export function mapLibrarySeries(item: SonarrSeries, baseUrl: string): MediaSearchItem {
  return {
    id: `lib-sonarr-${item.id}`,
    titleId: liveTitleId('sonarr', item.id),
    title: item.title,
    year: item.year ?? 0,
    type: 'series',
    rating: item.ratings?.value ?? 0,
    poster: sonarrPosterUrl(item, baseUrl) ?? '',
    overview: item.overview ?? '',
    source: 'library',
    alreadyAdded: true,
  }
}

export function mapLibraryMovie(item: RadarrMovie, baseUrl: string): MediaSearchItem {
  return {
    id: `lib-radarr-${item.id}`,
    titleId: liveTitleId('radarr', item.id),
    title: item.title,
    year: item.year ?? 0,
    type: 'movie',
    rating: item.ratings?.tmdb?.value ?? item.ratings?.value ?? 0,
    poster: radarrPosterUrl(item, baseUrl) ?? '',
    overview: item.overview ?? '',
    source: 'library',
    alreadyAdded: true,
  }
}

export function mapSonarrLookup(
  item: SonarrSeries & { tvdbId?: number },
  baseUrl: string,
): MediaSearchItem {
  return {
    id: `lookup-sonarr-${item.tvdbId ?? item.title}`,
    titleId: item.id ? liveTitleId('sonarr', item.id) : undefined,
    title: item.title,
    year: item.year ?? 0,
    type: 'series',
    rating: item.ratings?.value ?? 0,
    poster: sonarrPosterUrl(item, baseUrl) ?? '',
    overview: item.overview ?? '',
    source: 'sonarr',
    alreadyAdded: Boolean(item.id),
    raw: item,
  }
}

export function mapRadarrLookup(item: RadarrMovie, baseUrl: string): MediaSearchItem {
  return {
    id: `lookup-radarr-${item.tmdbId ?? item.title}`,
    titleId: item.id ? liveTitleId('radarr', item.id) : undefined,
    title: item.title,
    year: item.year ?? 0,
    type: 'movie',
    rating: item.ratings?.tmdb?.value ?? item.ratings?.value ?? 0,
    poster: radarrPosterUrl(item, baseUrl) ?? '',
    overview: item.overview ?? '',
    source: 'radarr',
    alreadyAdded: Boolean(item.id && item.id > 0),
    raw: item,
  }
}
