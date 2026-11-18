import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { MOBILE_TABS } from '@/components/layout/nav.constants'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface BottomTabBarProps {
  queueBadge?: number
  requestsBadge?: number
}

/** Floating glass dock in normal document flow (not fixed) for iOS Safari stability. */
export function BottomTabBar({ queueBadge, requestsBadge }: BottomTabBarProps) {
  const location = useLocation()

  return (
    <nav
      aria-label="Primary"
      className="shrink-0 px-3 pb-[max(10px,env(safe-area-inset-bottom,0px))] pt-1 lg:hidden"
    >
      <div
        className="glass mx-auto max-w-[var(--shell-max)] overflow-hidden"
        style={{ borderRadius: 'var(--radius-dock)' }}
      >
        <LayoutGroup id="bottom-tabs">
          <div className="grid grid-cols-5 gap-0.5 px-1.5 py-1.5">
            {MOBILE_TABS.map(({ to, label, icon: Icon, end }) => {
              const active = end
                ? location.pathname === to
                : location.pathname === to || location.pathname.startsWith(`${to}/`)
              const badge =
                label === 'Queue'
                  ? queueBadge
                  : label === 'More'
                    ? requestsBadge
                    : undefined

              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={cn(
                    'relative flex min-h-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[10px] font-medium tracking-wide transition active:scale-[0.96]',
                    active
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-muted-foreground)]',
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0.5 rounded-full bg-[var(--color-primary-muted)]"
                      transition={spring}
                    />
                  ) : null}
                  <span className="relative">
                    <Icon
                      className={cn('size-5', active ? 'stroke-[2.25]' : 'stroke-2')}
                      aria-hidden
                    />
                    {badge && badge > 0 ? (
                      <span className="absolute -right-2.5 -top-1.5 min-w-3.5 rounded-full bg-[var(--color-destructive)] px-1 text-center text-[9px] font-bold leading-[14px] text-white shadow-[0_0_0_2px_var(--color-card)]">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="relative">{label}</span>
                </NavLink>
              )
            })}
          </div>
        </LayoutGroup>
      </div>
    </nav>
  )
}
