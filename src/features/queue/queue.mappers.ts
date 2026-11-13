import type { DemoQueueItem } from '@/data/demoDashboard'
import { formatBytes, formatEta, formatSpeed } from '@/lib/format'
import { liveTitleId } from '@/lib/liveTitleId'
import type { QbitTorrent } from '@/lib/services/qbittorrent'
import type { SabQueue, SabQueueSlot } from '@/lib/services/sabnzbd'
import type { ArrQueueItem } from '@/lib/services/sonarr'

function qbitStatus(state: string): DemoQueueItem['status'] {
  const lower = state.toLowerCase()
  if (lower.includes('paused') || lower.includes('stopped')) return 'paused'
  if (lower.includes('downloading') || lower.includes('stalleddl') || lower.includes('meta')) {
    return 'downloading'
  }
  return 'queued'
}

export function mapQbitTorrent(
  torrent: QbitTorrent,
  serviceId: string,
): DemoQueueItem {
  return {
    id: `qbit-${torrent.hash}`,
    title: torrent.name,
    subtitle: torrent.category || 'qBittorrent',
    quality: torrent.category || 'Torrent',
    progress: Math.round(torrent.progress * 100),
    eta: formatEta(torrent.eta > 8640000 ? -1 : torrent.eta),
    speed: formatSpeed(torrent.dlspeed),
    size: formatBytes(torrent.size),
    status: qbitStatus(torrent.state),
    service: 'qbittorrent',
    poster: '',
    overview: torrent.name,
    indexers: [],
    clientServiceId: serviceId,
    clientItemId: torrent.hash,
    canPause: true,
  }
}

export function mapSabSlot(
  slot: SabQueueSlot,
  serviceId: string,
  queue?: SabQueue,
): DemoQueueItem {
  const status = slot.status.toLowerCase()
  return {
    id: `sab-${slot.nzo_id}`,
    title: slot.filename,
    subtitle: slot.category || 'SABnzbd',
    quality: slot.category || 'Usenet',
    progress: Math.round(Number(slot.percentage) || 0),
    eta: slot.timeleft || queue?.timeleft || '—',
    speed: queue?.speed ? `${queue.speed}` : '—',
    size: slot.size,
    status: status.includes('paused')
      ? 'paused'
      : status.includes('downloading')
        ? 'downloading'
        : 'queued',
    service: 'sabnzbd',
    poster: '',
    overview: slot.filename,
    indexers: [],
    clientServiceId: serviceId,
    clientItemId: slot.nzo_id,
    canPause: true,
  }
}

export function mapArrQueueItem(
  item: ArrQueueItem,
  kind: 'sonarr' | 'radarr',
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
    canPause: false,
  }
}
