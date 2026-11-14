import { EmptyState } from '@/components/ui/EmptyState'
import { useSeerrIssues } from '@/hooks/useSeerrIssues'

interface SeerrIssuesSectionProps {
  enabled: boolean
}

export function SeerrIssuesSection({ enabled }: SeerrIssuesSectionProps) {
  const issues = useSeerrIssues(enabled)

  if (!enabled) return null

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">Open issues</h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Reported problems from Seerr users
        </p>
      </div>
      {issues.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading issues…</p>
      ) : null}
      {issues.status === 'error' ? (
        <EmptyState title="Couldn’t load issues" description={issues.error} />
      ) : null}
      {issues.status === 'success' && issues.items.length === 0 ? (
        <EmptyState title="No open issues" description="Nothing reported right now." />
      ) : null}
      <div className="space-y-2">
        {issues.items.map((issue) => (
          <a
            key={issue.id}
            href={issue.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 transition hover:bg-white/5"
          >
            <p className="text-sm font-medium">{issue.title}</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
              {issue.subtitle} · {issue.status}
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}
