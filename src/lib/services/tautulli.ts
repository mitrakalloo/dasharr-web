import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

interface TautulliEnvelope<T> {
  response: { result: string; data: T; message?: string }
}

export interface TautulliSession {
  session_id?: string
  session_key?: string
  user?: string
  friendly_name?: string
  title?: string
  full_title?: string
  media_type?: string
  progress_percent?: string | number
  state?: string
  player?: string
  product?: string
  platform?: string
  quality_profile?: string
  stream_video_full_resolution?: string
  bandwidth?: string | number
  stream_bitrate?: string | number
  transcode_decision?: string
  video_decision?: string
  location?: string
}

export interface TautulliHistoryEntry {
  id?: number
  reference_id?: number
  user?: string
  friendly_name?: string
  full_title?: string
  title?: string
  grandparent_title?: string
  media_type?: string
  year?: number | string
  date?: number
  started?: number
  stopped?: number
  duration?: number
  percent_complete?: number
  player?: string
  platform?: string
  transcode_decision?: string
}

export interface TautulliHomeStatRow {
  title?: string
  user?: string
  friendly_name?: string
  total_plays?: number
  total_duration?: number
  users_watched?: number
  year?: number | string
}

export interface TautulliHomeStat {
  stat_id: string
  stat_title: string
  rows: TautulliHomeStatRow[]
}

function cmdPath(service: ServiceConfig, cmd: string, extra = ''): string {
  // API key is injected by the server BFF — never send it from the browser.
  void service
  return `/api/v2?cmd=${cmd}${extra}`
}

export async function getTautulliVersion(settings: AppSettings, service: ServiceConfig) {
  const payload = await serviceJson<TautulliEnvelope<{ version?: string }>>(
    settings,
    service,
    cmdPath(service, 'status'),
  )
  if (payload.response.result !== 'success') {
    throw new Error(payload.response.message ?? 'Tautulli status failed')
  }
  return payload.response.data?.version ?? 'ok'
}

export async function getTautulliSessions(settings: AppSettings, service: ServiceConfig) {
  const payload = await serviceJson<
    TautulliEnvelope<{ stream_count?: number; sessions?: TautulliSession[] }>
  >(settings, service, cmdPath(service, 'get_activity'))
  if (payload.response.result !== 'success') {
    throw new Error(payload.response.message ?? 'Tautulli activity failed')
  }
  return payload.response.data.sessions ?? []
}

export async function getTautulliHistory(
  settings: AppSettings,
  service: ServiceConfig,
  length = 25,
) {
  const payload = await serviceJson<TautulliEnvelope<{ data?: TautulliHistoryEntry[] }>>(
    settings,
    service,
    cmdPath(service, 'get_history', `&length=${length}`),
  )
  if (payload.response.result !== 'success') {
    throw new Error(payload.response.message ?? 'Tautulli history failed')
  }
  return payload.response.data?.data ?? []
}

export async function getTautulliHomeStats(settings: AppSettings, service: ServiceConfig) {
  const payload = await serviceJson<TautulliEnvelope<TautulliHomeStat[]>>(
    settings,
    service,
    cmdPath(service, 'get_home_stats', '&time_range=30&stats_count=5'),
  )
  if (payload.response.result !== 'success') {
    throw new Error(payload.response.message ?? 'Tautulli stats failed')
  }
  return Array.isArray(payload.response.data) ? payload.response.data : []
}

export async function terminateTautulliSession(
  settings: AppSettings,
  service: ServiceConfig,
  sessionId: string,
) {
  const payload = await serviceJson<TautulliEnvelope<unknown>>(
    settings,
    service,
    cmdPath(service, 'terminate_session', `&session_id=${encodeURIComponent(sessionId)}`),
  )
  if (payload.response.result !== 'success') {
    throw new Error(payload.response.message ?? 'Terminate failed')
  }
}
