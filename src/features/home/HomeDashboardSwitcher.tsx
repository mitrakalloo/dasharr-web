import { Link } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import type { HomeDashboard } from '@/lib/dashboard/dashboard.types'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
          Dashboards
        </p>
        <Link
          to="/edit-home"
          className="inline-flex min-h-[var(--tap)] items-center text-sm font-medium text-[var(--color-primary)]"
        >
          Edit
        </Link>
      </div>
      <LayoutGroup id="home-desks">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {dashboards.map((dashboard) => {
            const selected = dashboard.id === activeId
            return (
              <button
                key={dashboard.id}
                type="button"
                onClick={() => onSelect(dashboard.id)}
                className={cn(
                  'relative min-h-[var(--tap)] shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium transition active:scale-95',
                  selected
                    ? 'border-transparent text-[var(--color-on-primary-container)]'
                    : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]',
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId="home-desk-pill"
                    className="absolute inset-0 rounded-full bg-[var(--color-primary-container)]"
                    transition={spring}
                  />
                ) : null}
                <span className="relative z-10">{dashboard.name}</span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}
