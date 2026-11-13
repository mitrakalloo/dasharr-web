import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'
import { CalendarDays, LayoutDashboard, ListVideo, Search } from 'lucide-react'

import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

const tabs = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/queue', label: 'Queue', icon: ListVideo, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/search', label: 'Search', icon: Search, end: false },
]

interface BottomTabBarProps {
  queueBadge?: number
}

export function BottomTabBar({ queueBadge }: BottomTabBarProps) {
  const location = useLocation()

  return (
    <nav
      aria-label="Primary"
      className="z-40 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 px-2 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl"
    >
      <LayoutGroup id="bottom-tabs">
        <div className="grid grid-cols-4 gap-1 py-1">
          {tabs.map(({ to, label, icon: Icon, end }) => {
            const active = end
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(`${to}/`)

            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={cn(
                  'relative flex min-h-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition active:scale-95',
                  active
                    ? 'text-[var(--color-foreground)]'
                    : 'text-[var(--color-muted-foreground)]',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-1 rounded-xl bg-white/8"
                    transition={spring}
                  />
                ) : null}
                <span className="relative">
                  <Icon
                    className={cn('size-5', active ? 'stroke-[2.25]' : 'stroke-2')}
                    aria-hidden
                  />
                  {label === 'Queue' && queueBadge && queueBadge > 0 ? (
                    <span className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-[var(--color-destructive)] px-1 text-center text-[10px] font-semibold leading-4 text-white">
                      {queueBadge > 9 ? '9+' : queueBadge}
                    </span>
                  ) : null}
                </span>
                <span className="relative">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </LayoutGroup>
    </nav>
  )
}
