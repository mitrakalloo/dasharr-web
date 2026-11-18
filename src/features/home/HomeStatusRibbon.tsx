import { Link } from 'react-router-dom'

import { FreshnessLabel } from '@/components/ui/FreshnessLabel'

interface RibbonItem {
  label: string
  value: string
  to: string
  accent: string
}

interface HomeStatusRibbonProps {
  items: RibbonItem[]
  updatedAt?: number
}

export function HomeStatusRibbon({ items, updatedAt }: HomeStatusRibbonProps) {
  return (
    <div className="space-y-2">
      <FreshnessLabel updatedAt={updatedAt} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="magnetic panel flex min-h-[var(--tap)] flex-col justify-center rounded-[var(--radius-xl)] px-3 py-2.5 active:scale-[0.98]"
            style={{ ['--glow' as string]: item.accent }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
              {item.label}
            </span>
            <span className="tabular mt-0.5 text-lg font-semibold tracking-tight" style={{ color: item.accent }}>
              {item.value}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
