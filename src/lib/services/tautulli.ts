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
}

function cmdPath(service: ServiceConfig, cmd: string, extra = ''): string {
  const key = encodeURIComponent(service.apiKey)
  return `/api/v2?apikey=${key}&cmd=${cmd}${extra}`
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
