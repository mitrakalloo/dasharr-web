import type { DemoRelease } from '@/data/demoDashboard'
import { liveTitleId } from '@/lib/liveTitleId'
import type { LidarrAlbum } from '@/lib/services/lidarr'
import { lidarrCoverUrl } from '@/lib/services/lidarr'
import type { RadarrCalendarMovie } from '@/lib/services/radarr'
import { radarrPosterUrl } from '@/lib/services/radarr'
import type { SonarrCalendarEpisode } from '@/lib/services/sonarr'
import { sonarrPosterUrl } from '@/lib/services/sonarr'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function timeFromIso(iso?: string): string {
  if (!iso) return '12:00:00'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '12:00:00'
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

/** Prefer *arr calendar day (`YYYY-MM-DD`) so timezone shifts don’t move the event. */
function toAirDate(day?: string, iso?: string): string {
  if (day) return `${day}T${timeFromIso(iso)}`
  if (iso) return iso
  return new Date().toISOString()
}

export function mapSonarrEpisode(
  episode: SonarrCalendarEpisode,
  baseUrl: string,
): DemoRelease {
  const seriesTitle = episode.series?.title ?? 'Unknown series'
  const code = `S${pad(episode.seasonNumber)}E${pad(episode.episodeNumber)}`
  return {
    id: `sonarr-ep-${episode.id}`,
    searchId: episode.id,
    titleId: (() => {
      const seriesId = episode.series?.id ?? episode.seriesId
      return seriesId ? liveTitleId('sonarr', seriesId) : undefined
    })(),
    title: seriesTitle,
    subtitle: episode.title ? `${code} · ${episode.title}` : code,
    airDate: toAirDate(episode.airDate, episode.airDateUtc),
    kind: 'episode',
    service: 'sonarr',
    monitored: episode.monitored,
    hasFile: episode.hasFile,
    meta: episode.hasFile ? 'On disk' : 'Episode',
    poster: (episode.series ? sonarrPosterUrl(episode.series, baseUrl) : undefined) ?? '',
  }
}

export function mapRadarrMovie(movie: RadarrCalendarMovie, baseUrl: string): DemoRelease {
  const airDate =
    movie.digitalRelease ?? movie.physicalRelease ?? movie.inCinemas ?? undefined
  const releaseKind = movie.digitalRelease
    ? 'Digital'
    : movie.physicalRelease
      ? 'Physical'
      : movie.inCinemas
        ? 'In cinemas'
        : 'Release'

  const day = airDate?.slice(0, 10)
  return {
    id: `radarr-${movie.id}-${day ?? movie.id}`,
    searchId: movie.id,
    titleId: liveTitleId('radarr', movie.id),
    title: movie.title,
    subtitle: movie.year ? `${movie.year} · ${releaseKind}` : releaseKind,
    airDate: toAirDate(day, airDate),
    kind: 'movie',
    service: 'radarr',
    monitored: movie.monitored,
    hasFile: movie.hasFile,
    meta: movie.hasFile ? 'On disk' : releaseKind,
    poster: radarrPosterUrl(movie, baseUrl) ?? '',
  }
}

export function mapLidarrAlbum(album: LidarrAlbum, baseUrl: string): DemoRelease {
  const day = album.releaseDate?.slice(0, 10)
  return {
    id: `lidarr-${album.id}-${day ?? album.id}`,
    titleId: liveTitleId('lidarr', album.id),
    title: album.artist?.artistName ?? album.title,
    subtitle: album.title,
    airDate: toAirDate(day, album.releaseDate),
    kind: 'album',
    service: 'lidarr',
    monitored: album.monitored,
    hasFile: false,
    meta: 'Album',
    poster:
      lidarrCoverUrl(album, baseUrl) ??
      (album.artist ? lidarrCoverUrl(album.artist, baseUrl) : undefined) ??
      '',
  }
}

export function calendarDateRange(daysBack = 45, daysForward = 90): {
  start: string
  end: string
} {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - daysBack)
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  end.setDate(end.getDate() + daysForward)

  const fmt = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  return { start: fmt(start), end: fmt(end) }
}
