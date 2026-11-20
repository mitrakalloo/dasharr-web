import { ExternalLink, MessageSquareWarning } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useSeerrIssues } from '@/hooks/useSeerrIssues'

interface SeerrIssuesSectionProps {
  enabled: boolean
}

export function SeerrIssuesSection({ enabled }: SeerrIssuesSectionProps) {
  const issues = useSeerrIssues(enabled)

  if (!enabled) return null

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Open issues"
        count={issues.status === 'success' ? issues.items.length : undefined}
        trailing={
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Reported by Seerr users
          </span>
        }
      />

      {issues.status === 'loading' ? (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="panel rounded-[var(--radius-2xl)] p-3.5">
              <div className="skeleton h-4 w-44" />
              <div className="skeleton mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      ) : null}

      {issues.status === 'error' ? (
        <EmptyState compact title="Couldn’t load issues" description={issues.error} />
      ) : null}

      {issues.status === 'success' && issues.items.length === 0 ? (
        <EmptyState
          compact
          icon={<MessageSquareWarning className="size-5" aria-hidden="true" />}
          title="No open issues"
          description="Nothing reported right now."
        />
      ) : null}

      {issues.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {issues.items.map((issue) => (
            <a
              key={issue.id}
              href={issue.url}
              target="_blank"
              rel="noreferrer"
              className="group panel magnetic flex items-start justify-between gap-3 rounded-[var(--radius-2xl)] px-4 py-3 transition hover:bg-[var(--color-hover)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                    {issue.title}
                  </p>
                  <Badge tone="warning">{issue.status}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--color-muted-foreground)]">
                  {issue.subtitle}
                </p>
              </div>
              <ExternalLink
                className="mt-0.5 size-4 shrink-0 text-[var(--color-muted-foreground)] transition-colors group-hover:text-[var(--color-foreground)]"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      ) : null}
    </section>
  )
}
