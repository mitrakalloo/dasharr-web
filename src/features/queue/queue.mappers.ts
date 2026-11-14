import type { DemoQueueItem, DemoSeerrRequest } from '@/data/demoDashboard'
import { formatBytes } from '@/lib/format'
import { liveTitleId } from '@/lib/liveTitleId'
import type { ArrQueueItem } from '@/lib/services/sonarr'
import type { TautulliSession } from '@/lib/services/tautulli'

export {
  mapDelugeTorrent,
  mapNzbgetGroup,
  mapQbitTorrent,
  mapSabSlot,
  mapTransmissionTorrent,
} from '@/features/queue/queue.clientMappers'

export function mapArrQueueItem(
  item: ArrQueueItem,
  kind: 'sonarr' | 'radarr',
  serviceId: string,
): DemoQueueItem {
  const done = item.size > 0 ? ((item.size - item.sizeleft) / item.size) * 100 : 0
  const state = (item.trackedDownloadState ?? item.status).toLowerCase()
  const titleId =
    kind === 'sonarr' && item.seriesId
      ? liveTitleId('sonarr', item.seriesId)
      : kind === 'radarr' && item.movieId
        ? liveTitleId('radarr', item.movieId)
        : undefined

  return {
    id: `${kind}-queue-${item.id}`,
    titleId,
    title: item.title,
    subtitle: item.protocol ?? kind,
    quality: item.protocol ?? 'Download',
    progress: Math.max(0, Math.min(100, Math.round(done))),
    eta: item.timeleft ?? '—',
    speed: '—',
    size: formatBytes(item.size),
    status: state.includes('paused')
      ? 'paused'
      : state.includes('downloading') || state.includes('import')
        ? 'downloading'
        : 'queued',
    service: kind,
    poster: '',
    overview: item.title,
    indexers: [],
    clientServiceId: serviceId,
    clientItemId: String(item.id),
    canPause: false,
    canRemove: true,
  }
}

export function mapSeerrRequestItem(request: DemoSeerrRequest): DemoQueueItem {
  return {
    id: `seerr-req-${request.id}`,
    titleId: request.titleId,
    title: request.title,
    subtitle: `${request.requestedBy} · ${request.status}`,
    quality: request.quality,
    progress: request.status === 'approved' ? 100 : 0,
    eta: request.requestedAt,
    speed: '—',
    size: '—',
    status: 'request',
    service: 'seerr',
    poster: request.poster,
    overview: request.overview,
    indexers: [],
    canPause: false,
    canRemove: false,
  }
}

export function mapTautulliSession(
  session: TautulliSession,
  serviceId: string,
  index: number,
): DemoQueueItem {
  const progress = Number(session.progress_percent) || 0
  const id = session.session_id ?? session.session_key ?? `session-${index}`
  return {
    id: `tautulli-${id}`,
    title: session.full_title ?? session.title ?? 'Playback',
    subtitle: `${session.friendly_name ?? session.user ?? 'User'} · ${session.player ?? session.product ?? 'Plex'}`,
    quality:
      session.stream_video_full_resolution ??
      session.quality_profile ??
      session.transcode_decision ??
      'Stream',
    progress: Math.max(0, Math.min(100, Math.round(progress))),
    eta: session.state ?? 'playing',
    speed: session.bandwidth ? `${session.bandwidth}` : '—',
    size: '—',
    status: 'watching',
    service: 'tautulli',
    poster: '',
    overview: session.full_title ?? session.title ?? '',
    indexers: [],
    clientServiceId: serviceId,
    clientItemId: session.session_id ?? session.session_key,
    canPause: false,
    canRemove: Boolean(session.session_id ?? session.session_key),
  }
}
