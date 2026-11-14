import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface DiscoverCard {
  id: string
  tmdbId: number
  title: string
  year?: number
  type: 'movie' | 'tv'
  poster: string
  rating?: number
  status?: string
}

export interface DiscoverShelf {
  id: string
  title: string
  items: DiscoverCard[]
}

interface SeerrDiscoverItem {
  id: number
  mediaType?: string
  title?: string
  name?: string
  releaseDate?: string
  firstAirDate?: string
  posterPath?: string
  voteAverage?: number
  mediaInfo?: { status?: number }
}

function tmdbPoster(path?: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w185${path}`
}

function mapCard(
  item: SeerrDiscoverItem,
  prefix: string,
  forcedType?: 'movie' | 'tv',
): DiscoverCard {
  const type =
    forcedType ??
    (item.mediaType === 'tv' ? 'tv' : item.mediaType === 'movie' ? 'movie' : 'movie')
  const release = item.releaseDate ?? item.firstAirDate
  return {
    id: `${prefix}-${item.id}`,
    tmdbId: item.id,
    title: item.title ?? item.name ?? `Title ${item.id}`,
    year: release ? Number(release.slice(0, 4)) || undefined : undefined,
    type,
    poster: tmdbPoster(item.posterPath),
    rating: item.voteAverage && item.voteAverage > 0 ? item.voteAverage : undefined,
  }
}

async function fetchShelf(
  settings: AppSettings,
  service: ServiceConfig,
  path: string,
  prefix: string,
  forcedType?: 'movie' | 'tv',
): Promise<DiscoverCard[]> {
  const payload = await serviceJson<{ results?: SeerrDiscoverItem[] } | SeerrDiscoverItem[]>(
    settings,
    service,
    path,
  )
  const results = Array.isArray(payload) ? payload : (payload.results ?? [])
  return results.slice(0, 18).map((item) => mapCard(item, prefix, forcedType))
}

export async function getSeerrDiscoverShelves(
  settings: AppSettings,
  service: ServiceConfig,
): Promise<DiscoverShelf[]> {
  const [trending, popularMovies, popularTv, upcomingMovies, upcomingTv] =
    await Promise.all([
      fetchShelf(settings, service, '/api/v1/discover/trending?page=1', 'trend').catch(() => []),
      fetchShelf(
        settings,
        service,
        '/api/v1/discover/movies?page=1&sortBy=popularity.desc',
        'pop-m',
        'movie',
      ).catch(() => []),
      fetchShelf(
        settings,
        service,
        '/api/v1/discover/tv?page=1&sortBy=popularity.desc',
        'pop-t',
        'tv',
      ).catch(() => []),
      fetchShelf(
        settings,
        service,
        '/api/v1/discover/movies/upcoming?page=1',
        'up-m',
        'movie',
      ).catch(() => []),
      fetchShelf(settings, service, '/api/v1/discover/tv/upcoming?page=1', 'up-t', 'tv').catch(
        () => [],
      ),
    ])

  return [
    { id: 'trending', title: 'Trending', items: trending },
    { id: 'popular-movies', title: 'Popular movies', items: popularMovies },
    { id: 'popular-tv', title: 'Popular series', items: popularTv },
    { id: 'upcoming-movies', title: 'Upcoming movies', items: upcomingMovies },
    { id: 'upcoming-tv', title: 'Upcoming series', items: upcomingTv },
  ].filter((shelf) => shelf.items.length > 0)
}
