import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface SeerrIssue {
  id: number
  issueType?: number
  status?: number
  createdAt?: string
  media?: { tmdbId?: number; mediaType?: string }
  createdBy?: { displayName?: string }
  comments?: Array<{ message?: string }>
}

export interface SeerrIssueItem {
  id: string
  title: string
  subtitle: string
  status: string
  url?: string
}

function mapIssue(issue: SeerrIssue, baseUrl: string): SeerrIssueItem {
  const comment = issue.comments?.[0]?.message
  const media = issue.media?.mediaType ?? 'media'
  return {
    id: String(issue.id),
    title: comment?.slice(0, 80) || `${media} issue #${issue.id}`,
    subtitle: issue.createdBy?.displayName
      ? `${issue.createdBy.displayName} · ${media}`
      : media,
    status: issue.status === 2 ? 'Resolved' : 'Open',
    url: `${baseUrl.replace(/\/+$/, '')}/issues/${issue.id}`,
  }
}

export async function listSeerrIssues(settings: AppSettings, service: ServiceConfig) {
  const paths = [
    '/api/v1/issue?take=20&filter=open&sort=added',
    '/api/v1/issues?take=20&filter=open',
    '/api/v1/issue?take=20&filter=all',
  ]
  for (const path of paths) {
    try {
      const payload = await serviceJson<{ results?: SeerrIssue[] } | SeerrIssue[]>(
        settings,
        service,
        path,
      )
      const results = Array.isArray(payload) ? payload : (payload.results ?? [])
      return results.map((issue) => mapIssue(issue, service.baseUrl))
    } catch {
      // try next shape
    }
  }
  return [] as SeerrIssueItem[]
}
