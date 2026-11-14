import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'
import { ChevronsLeft, ChevronsRight, Settings } from 'lucide-react'

import { DasharrMark, DasharrWordmark } from '@/components/brand/DasharrMark'
import { PRIMARY_NAV, RAIL_COLLAPSED_KEY } from '@/components/layout/nav.constants'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface SideNavRailProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  queueBadge?: number
}

export function SideNavRail({ collapsed, onCollapsedChange, queueBadge = 0 }: SideNavRailProps) {
  const location = useLocation()

  function toggle() {
    const next = !collapsed
    onCollapsedChange(next)
    try {
      localStorage.setItem(RAIL_COLLAPSED_KEY, next ? '1' : '0')
    } catch {
      // ignore
    }
  }

  return (
    <aside
      className={cn(
        'hidden h-dvh shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-xl lg:flex',
        collapsed ? 'w-[var(--rail-compact)]' : 'w-[var(--rail-expanded)]',
      )}
    >
      <div className={cn('flex h-14 items-center px-3', collapsed && 'justify-center')}>
        {collapsed ? <DasharrMark /> : <DasharrWordmark />}
      </div>

      <LayoutGroup id="side-nav">
        <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-2 py-2">
          {PRIMARY_NAV.map(({ to, label, icon: Icon, end, shortcut }) => {
            const active = end
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(`${to}/`)

            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={collapsed ? label : undefined}
                className={cn(
                  'relative flex min-h-[var(--tap)] items-center gap-3 rounded-xl px-3 text-sm font-medium transition active:scale-[0.97]',
                  collapsed && 'justify-center px-0',
                  active
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-muted-foreground)] hover:bg-white/5 hover:text-[var(--color-foreground)]',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="side-nav-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--color-primary-muted)]"
                    transition={spring}
                  />
                ) : null}
                <span className="relative">
                  <Icon className={cn('size-5', active && 'stroke-[2.25]')} aria-hidden />
                  {label === 'Queue' && queueBadge > 0 ? (
                    <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-[var(--color-destructive)] px-1 text-center text-[10px] font-semibold leading-4 text-white">
                      {queueBadge > 9 ? '9+' : queueBadge}
                    </span>
                  ) : null}
                </span>
                {!collapsed ? (
                  <>
                    <span className="relative flex-1">{label}</span>
                    {shortcut ? (
                      <kbd className="relative rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted-foreground)]">
                        {shortcut}
                      </kbd>
                    ) : null}
                  </>
                ) : null}
              </NavLink>
            )
          })}
        </nav>
      </LayoutGroup>

      <div className="space-y-1 border-t border-[var(--color-border)] p-2">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex min-h-[var(--tap)] items-center gap-3 rounded-xl px-3 text-sm text-[var(--color-muted-foreground)] transition hover:bg-white/5 hover:text-[var(--color-foreground)] active:scale-[0.97]',
            collapsed && 'justify-center px-0',
          )}
        >
          <Settings className="size-5" aria-hidden />
          {!collapsed ? <span>Settings</span> : null}
        </NavLink>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex min-h-[var(--tap)] w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-[var(--color-muted-foreground)] transition hover:bg-white/5 hover:text-[var(--color-foreground)] active:scale-[0.97]',
            collapsed && 'justify-center px-0',
          )}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <ChevronsRight className="size-5" /> : <ChevronsLeft className="size-5" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  )
}
