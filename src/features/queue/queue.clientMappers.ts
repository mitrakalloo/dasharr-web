import type { DemoQueueItem } from '@/data/demoDashboard'
import { formatBytes, formatEta, formatSpeed } from '@/lib/format'
import type { DelugeTorrent } from '@/lib/services/deluge'
import type { NzbgetGroup } from '@/lib/services/nzbget'
import type { QbitTorrent } from '@/lib/services/qbittorrent'
import type { SabQueue, SabQueueSlot } from '@/lib/services/sabnzbd'
import type { TransmissionTorrent } from '@/lib/services/transmission'

function guessReleaseGroup(name: string): string | undefined {
  const match = name.match(/[-_.\[]([A-Za-z0-9]+)\]?$/)
  const group = match?.[1]
  if (!group || group.length < 2 || group.length > 16) return undefined
  if (/^\d+$/.test(group)) return undefined
  return group
}

function qbitStatus(state: string): DemoQueueItem['status'] {
  const lower = state.toLowerCase()
  if (lower.includes('paused') || lower.includes('stopped')) return 'paused'
  if (lower.includes('downloading') || lower.includes('stalleddl') || lower.includes('meta')) {
    return 'downloading'
  }
  return 'queued'
}

export function mapQbitTorrent(torrent: QbitTorrent, serviceId: string): DemoQueueItem {
  return {
    id: `qbit-${torrent.hash}`,
    title: torrent.name,
    subtitle: torrent.category || 'qBittorrent',
    quality: torrent.category || 'Torrent',
    releaseGroup: guessReleaseGroup(torrent.name),
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
    canRemove: true,
    canRetry: true,
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
    releaseGroup: guessReleaseGroup(slot.filename),
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
    canRemove: true,
    canRetry: true,
  }
}

/** Transmission status: 0 stopped, 1–2 check, 3–4 download, 5–6 seed */
function transmissionStatus(status: number): DemoQueueItem['status'] {
  if (status === 0) return 'paused'
  if (status === 3 || status === 4) return 'downloading'
  return 'queued'
}

export function mapTransmissionTorrent(
  torrent: TransmissionTorrent,
  serviceId: string,
): DemoQueueItem {
  return {
    id: `tx-${torrent.id}`,
    title: torrent.name,
    subtitle: 'Transmission',
    quality: 'Torrent',
    releaseGroup: guessReleaseGroup(torrent.name),
    progress: Math.round(torrent.percentDone * 100),
    eta: formatEta(torrent.eta < 0 ? -1 : torrent.eta),
    speed: formatSpeed(torrent.rateDownload),
    size: formatBytes(torrent.totalSize),
    status: transmissionStatus(torrent.status),
    service: 'transmission',
    poster: '',
    overview: torrent.name,
    indexers: [],
    clientServiceId: serviceId,
    clientItemId: String(torrent.id),
    canPause: true,
    canRemove: true,
  }
}

export function mapNzbgetGroup(group: NzbgetGroup, serviceId: string): DemoQueueItem {
  const total = group.FileSizeMB || 0
  const remaining = group.RemainingSizeMB || 0
  const done = total > 0 ? ((total - remaining) / total) * 100 : 0
  const status = group.Status.toLowerCase()
  return {
    id: `nzbget-${group.NZBID}`,
    title: group.NZBName,
    subtitle: 'NZBGet',
    quality: 'Usenet',
    releaseGroup: guessReleaseGroup(group.NZBName),
    progress: Math.max(0, Math.min(100, Math.round(done))),
    eta: '—',
    speed: formatSpeed(group.DownloadRate),
    size: formatBytes(total * 1024 * 1024),
    status: status.includes('paused')
      ? 'paused'
      : status.includes('downloading')
        ? 'downloading'
        : 'queued',
    service: 'nzbget',
    poster: '',
    overview: group.NZBName,
    indexers: [],
    clientServiceId: serviceId,
    clientItemId: String(group.NZBID),
    canPause: true,
    canRemove: true,
  }
}

export function mapDelugeTorrent(torrent: DelugeTorrent, serviceId: string): DemoQueueItem {
  const state = torrent.state.toLowerCase()
  return {
    id: `deluge-${torrent.hash}`,
    title: torrent.name,
    subtitle: 'Deluge',
    quality: 'Torrent',
    releaseGroup: guessReleaseGroup(torrent.name),
    progress: Math.round(torrent.progress * 100),
    eta: formatEta(torrent.eta < 0 ? -1 : torrent.eta),
    speed: formatSpeed(torrent.download_payload_rate),
    size: formatBytes(torrent.total_size),
    status: state.includes('paused')
      ? 'paused'
      : state.includes('downloading')
        ? 'downloading'
        : 'queued',
    service: 'deluge',
    poster: '',
    overview: torrent.name,
    indexers: [],
    clientServiceId: serviceId,
    clientItemId: torrent.hash,
    canPause: true,
    canRemove: true,
  }
}
