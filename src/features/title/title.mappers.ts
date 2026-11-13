import type { DemoTitle, TitleEpisode, TitleSeason } from '@/data/demoTitles'
import { formatBytes } from '@/lib/format'
import { liveTitleId } from '@/lib/liveTitleId'
import type { LidarrAlbum } from '@/lib/services/lidarr'
import { lidarrCoverUrl } from '@/lib/services/lidarr'
import type { RadarrMovie } from '@/lib/services/radarr'
import { radarrPosterUrl } from '@/lib/services/radarr'
import type { SonarrEpisode, SonarrSeries } from '@/lib/services/sonarr'
import { sonarrPosterUrl } from '@/lib/services/sonarr'

function mapEpisodes(episodes: SonarrEpisode[], seasonNumber: number): TitleEpisode[] {
  return episodes
    .filter((episode) => episode.seasonNumber === seasonNumber)
    .sort((a, b) => a.episodeNumber - b.episodeNumber)
    .map((episode) => ({
      id: String(episode.id),
      episodeNumber: episode.episodeNumber,
      title: episode.title ?? `Episode ${episode.episodeNumber}`,
      airDate: episode.airDate ?? '',
      hasFile: episode.hasFile,
      monitored: episode.monitored,
      quality: episode.episodeFile?.quality?.quality?.name,
      size: episode.episodeFile?.size ? formatBytes(episode.episodeFile.size) : undefined,
    }))
}

export function mapSonarrTitle(
  series: SonarrSeries,
  episodes: SonarrEpisode[],
  baseUrl: string,
): DemoTitle {
  const seasons: TitleSeason[] = (series.seasons ?? [])
    .filter((season) => season.seasonNumber > 0)
    .map((season) => ({
      seasonNumber: season.seasonNumber,
      episodeFileCount: season.statistics?.episodeFileCount ?? 0,
      episodeCount: season.statistics?.episodeCount ?? 0,
      sizeOnDisk: formatBytes(season.statistics?.sizeOnDisk ?? 0),
      episodes: mapEpisodes(episodes, season.seasonNumber),
    }))

  return {
    id: liveTitleId('sonarr', series.id),
    kind: 'series',
    service: 'sonarr',
    title: series.title,
    year: series.year ?? 0,
    runtime: series.runtime ? `${series.runtime}m` : '—',
    rating: series.ratings?.value ?? 0,
    genres: series.genres ?? [],
    overview: series.overview ?? '',
    status: series.status,
    monitored: series.monitored,
    network: series.network,
    quality: 'Library',
    sizeOnDisk: formatBytes(series.statistics?.sizeOnDisk ?? 0),
    path: series.path ?? '',
    poster: sonarrPosterUrl(series, baseUrl) ?? '',
    seasons,
    releases: [],
  }
}

export function mapRadarrTitle(movie: RadarrMovie, baseUrl: string): DemoTitle {
  const rating = movie.ratings?.tmdb?.value ?? movie.ratings?.imdb?.value ?? movie.ratings?.value ?? 0
  return {
    id: liveTitleId('radarr', movie.id),
    kind: 'movie',
    service: 'radarr',
    title: movie.title,
    year: movie.year ?? 0,
    runtime: movie.runtime ? `${movie.runtime}m` : '—',
    rating,
    genres: movie.genres ?? [],
    overview: movie.overview ?? '',
    status: movie.status,
    monitored: movie.monitored,
    quality: movie.hasFile ? 'On disk' : 'Missing',
    sizeOnDisk: formatBytes(movie.sizeOnDisk ?? 0),
    path: movie.path ?? '',
    poster: radarrPosterUrl(movie, baseUrl) ?? '',
    releases: [],
  }
}

export function mapLidarrTitle(album: LidarrAlbum, baseUrl: string): DemoTitle {
  return {
    id: liveTitleId('lidarr', album.id),
    kind: 'movie',
    service: 'lidarr',
    title: `${album.artist?.artistName ?? 'Artist'} · ${album.title}`,
    year: album.releaseDate ? Number(album.releaseDate.slice(0, 4)) : 0,
    runtime: '—',
    rating: 0,
    genres: [],
    overview: album.overview ?? '',
    status: album.monitored ? 'monitored' : 'unmonitored',
    monitored: album.monitored,
    quality: 'Album',
    sizeOnDisk: '—',
    path: '',
    poster:
      lidarrCoverUrl(album, baseUrl) ??
      (album.artist ? lidarrCoverUrl(album.artist, baseUrl) : undefined) ??
      '',
    releases: [],
  }
}
