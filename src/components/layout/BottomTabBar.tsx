import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'

import { MOBILE_TABS } from '@/components/layout/nav.constants'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface BottomTabBarProps {
  queueBadge?: number
}

/** Floating glass dock in normal document flow (not fixed) for iOS Safari stability. */
export function BottomTabBar({ queueBadge }: BottomTabBarProps) {
  const location = useLocation()

  return (
    <nav
      aria-label="Primary"
      className="shrink-0 px-4 pb-[max(10px,env(safe-area-inset-bottom,0px))] pt-1 lg:hidden"
    >
      <div
        className="mx-auto max-w-[var(--shell-max)] overflow-hidden border border-[var(--color-hairline)] bg-[var(--color-card)]/92 shadow-[var(--elevation-float)] backdrop-blur-2xl"
        style={{ borderRadius: 'var(--radius-dock)' }}
      >
        <LayoutGroup id="bottom-tabs">
          <div className="grid grid-cols-5 gap-0.5 px-1 py-1.5">
            {MOBILE_TABS.map(({ to, label, icon: Icon, end }) => {
              const active = end
                ? location.pathname === to
                : location.pathname === to || location.pathname.startsWith(`${to}/`)

              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={cn(
                    'relative flex min-h-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[10px] font-medium transition active:scale-[0.96]',
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
                    {label === 'Queue' && queueBadge && queueBadge > 0 ? (
                      <span className="absolute -right-2.5 -top-1.5 min-w-3.5 rounded-full bg-[var(--color-destructive)] px-1 text-center text-[9px] font-bold leading-[14px] text-white">
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
      </div>
    </nav>
  )
}
