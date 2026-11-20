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
      <EmptyState
        compact
        title="No upcoming releases"
        description="Nothing monitored is airing soon."
      />
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.id} className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
              {group.label}
            </h3>
            <span className="tabular text-[11px] font-medium text-[var(--color-muted-foreground)]">
              {group.items.length}
            </span>
          </div>
          <div className="panel overflow-hidden rounded-[var(--radius-2xl)]">
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
    </div>
  )
}
