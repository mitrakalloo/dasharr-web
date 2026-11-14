export const DISCOVER_CATEGORIES = [
  { id: 'trending', label: 'Trending', path: '/api/v1/discover/trending?page=1' },
  {
    id: 'popular-movies',
    label: 'Popular movies',
    path: '/api/v1/discover/movies?page=1&sortBy=popularity.desc',
    type: 'movie' as const,
  },
  {
    id: 'popular-tv',
    label: 'Popular series',
    path: '/api/v1/discover/tv?page=1&sortBy=popularity.desc',
    type: 'tv' as const,
  },
  {
    id: 'upcoming-movies',
    label: 'Upcoming movies',
    path: '/api/v1/discover/movies/upcoming?page=1',
    type: 'movie' as const,
  },
  {
    id: 'upcoming-tv',
    label: 'Upcoming series',
    path: '/api/v1/discover/tv/upcoming?page=1',
    type: 'tv' as const,
  },
  {
    id: 'action-movies',
    label: 'Action movies',
    path: '/api/v1/discover/movies?page=1&genre=28&sortBy=popularity.desc',
    type: 'movie' as const,
  },
  {
    id: 'drama-tv',
    label: 'Drama series',
    path: '/api/v1/discover/tv?page=1&genre=18&sortBy=popularity.desc',
    type: 'tv' as const,
  },
]

export function providerCategory(watchRegion: string) {
  return {
    id: 'netflix',
    label: 'On Netflix',
    path: `/api/v1/discover/movies?page=1&watchRegion=${encodeURIComponent(watchRegion)}&watchProviders=8&sortBy=popularity.desc`,
    type: 'movie' as const,
  }
}

export function tmdbPoster(path?: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w185${path}`
}
