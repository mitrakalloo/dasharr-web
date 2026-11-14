import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { UpcomingReleaseRow } from '@/features/calendar/UpcomingReleaseRow'
import { groupUpcomingReleases } from '@/features/overview/upcoming.helpers'
import type { DemoRelease } from '@/data/demoDashboard'

interface UpcomingGroupedListProps {
  releases: DemoRelease[]
  onToggle?: (id: string) => void
}

export function UpcomingGroupedList({ releases, onToggle }: UpcomingGroupedListProps) {
  const groups = groupUpcomingReleases(releases)

  if (groups.length === 0) {
    return (
      <EmptyState title="No upcoming releases" description="Nothing monitored is airing soon." />
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
              {group.label}
            </h3>
            <span className="tabular text-[11px] text-[var(--color-muted-foreground)]">
              {group.items.length}
            </span>
          </div>
          <div className="panel overflow-hidden rounded-2xl">
            {group.items.map((release, index) => (
              <UpcomingReleaseRow
                key={release.id}
                release={release}
                bordered={index < group.items.length - 1}
                onToggle={onToggle ? () => onToggle(release.id) : undefined}
              />
            ))}
          </div>
        </section>
      ))}
      <Link to="/calendar" className="inline-flex min-h-[var(--tap)] items-center text-sm text-[var(--color-accent)]">
        Open calendar
      </Link>
    </div>
  )
}
