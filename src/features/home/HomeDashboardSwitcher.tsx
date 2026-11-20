import { Link } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'

import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { HomeDashboard } from '@/lib/dashboard/dashboard.types'

interface HomeDashboardSwitcherProps {
  dashboards: HomeDashboard[]
  activeId: string
  onSelect: (id: string) => void
}

export function HomeDashboardSwitcher({
  dashboards,
  activeId,
  onSelect,
}: HomeDashboardSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <SegmentedControl
        ariaLabel="Dashboards"
        value={activeId}
        onChange={onSelect}
        bleedMobile
        className="min-w-0 flex-1"
        options={dashboards.map((dashboard) => ({
          value: dashboard.id,
          label: dashboard.name,
        }))}
      />
      <Link
        to="/edit-home"
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-xs font-semibold text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-foreground)] active:scale-95"
      >
        <SlidersHorizontal className="size-3.5" aria-hidden />
        <span>Customize</span>
      </Link>
    </div>
  )
}
