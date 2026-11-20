import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

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
    <div className="space-y-2.5">
      <FreshnessLabel updatedAt={updatedAt} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="magnetic panel group relative flex min-h-[76px] flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] px-3.5 py-3 active:scale-[0.98]"
            style={{ ['--glow' as string]: item.accent }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity group-hover:opacity-100"
              style={{ backgroundColor: item.accent }}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                {item.label}
              </span>
              <ArrowUpRight
                className="size-3.5 text-[var(--color-muted-foreground)]/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
                aria-hidden
              />
            </div>
            <span
              className="tabular mt-2 text-xl font-semibold tracking-tight sm:text-2xl"
              style={{ color: item.accent }}
            >
              {item.value}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
