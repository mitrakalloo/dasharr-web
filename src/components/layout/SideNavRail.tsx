import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGroup, motion } from 'motion/react'
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Keyboard,
  Moon,
  Server,
  Settings,
  Sun,
} from 'lucide-react'

import { DasharrMark, DasharrWordmark } from '@/components/brand/DasharrMark'
import {
  LIBRARY_NAV,
  RAIL_COLLAPSED_KEY,
  WORKSPACE_NAV,
  type PrimaryNavItem,
} from '@/components/layout/nav.constants'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useStackHealth } from '@/hooks/useStackHealth'
import { cn } from '@/lib/cn'
import { spring } from '@/lib/motion'
import { serviceAccent } from '@/lib/serviceColors'
import { usePrefsStore } from '@/stores/prefsStore'

interface SideNavRailProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onShortcutsClick?: () => void
  queueBadge?: number
  requestsBadge?: number
}

export function SideNavRail({
  collapsed,
  onCollapsedChange,
  onShortcutsClick,
  queueBadge = 0,
  requestsBadge = 0,
}: SideNavRailProps) {
  const location = useLocation()
  const { hasAny } = useConfiguredStack()
  const { services, health } = useStackHealth()
  const themePreference = usePrefsStore((state) => state.experience.themePreference)
  const setExperience = usePrefsStore((state) => state.setExperience)
  const [servicesOpen, setServicesOpen] = useState(true)

  const isLight =
    themePreference === 'light' ||
    (themePreference === 'system' &&
      typeof document !== 'undefined' &&
      document.documentElement.dataset.theme === 'light')

  function toggleCollapsed() {
    const next = !collapsed
    onCollapsedChange(next)
    try {
      localStorage.setItem(RAIL_COLLAPSED_KEY, next ? '1' : '0')
    } catch {
      // ignore
    }
  }

  function toggleTheme() {
    setExperience({ themePreference: isLight ? 'dark' : 'light' })
  }

  function isVisible(item: PrimaryNavItem) {
    if (!item.requiresService || item.requiresService.length === 0) return true
    return hasAny(...item.requiresService)
  }

  const workspaceItems = WORKSPACE_NAV.filter(isVisible)
  const libraryItems = LIBRARY_NAV.filter(isVisible)

  function renderNavItem({ to, label, icon: Icon, end, shortcut }: PrimaryNavItem) {
    const active = end
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`)
    const badge =
      label === 'Queue' ? queueBadge : label === 'Requests' ? requestsBadge : 0

    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        title={collapsed ? label : undefined}
        className={cn(
          'relative flex min-h-10 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium tracking-tight transition-colors active:scale-[0.98]',
          collapsed && 'justify-center px-0',
          active
            ? 'text-[var(--color-primary)]'
            : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]',
        )}
      >
        {active ? (
          <motion.span
            layoutId="side-nav-pill"
            className="absolute inset-0 rounded-[var(--radius-md)] border border-[var(--color-primary)]/20 bg-[var(--color-primary-muted)]"
            transition={spring}
          />
        ) : null}
        <span className="relative flex items-center justify-center">
          <Icon className={cn('size-[18px]', active && 'stroke-[2.25]')} aria-hidden />
          {collapsed && badge > 0 ? (
            <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-[var(--color-destructive)] px-1 text-center text-[9px] font-bold leading-4 text-white">
              {badge > 9 ? '9+' : badge}
            </span>
          ) : null}
        </span>
        {!collapsed ? (
          <>
            <span className="relative flex-1 truncate">{label}</span>
            {badge > 0 ? (
              <span className="relative tabular rounded-full bg-[var(--color-destructive)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {badge > 99 ? '99+' : badge}
              </span>
            ) : shortcut ? (
              <kbd className="relative rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted-foreground)]">
                {shortcut}
              </kbd>
            ) : null}
          </>
        ) : null}
      </NavLink>
    )
  }

  const settingsActive = location.pathname.startsWith('/settings')

  return (
    <aside
      className={cn(
        'hidden h-dvh shrink-0 flex-col border-r border-[var(--color-hairline)] bg-[var(--color-card)]/85 backdrop-blur-2xl transition-[width] duration-300 ease-[var(--ease-out-expo)] lg:flex',
        collapsed ? 'w-[var(--rail-compact)]' : 'w-[var(--rail-expanded)]',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-[var(--color-hairline)] px-4',
          collapsed && 'justify-center px-0',
        )}
      >
        <NavLink to="/" aria-label="Dasharr Home" className="flex items-center">
          {collapsed ? <DasharrMark /> : <DasharrWordmark />}
        </NavLink>
      </div>

      <LayoutGroup id="side-nav">
        <nav
          aria-label="Primary"
          className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto px-2.5 py-4"
        >
          <div className="space-y-1">
            {!collapsed ? (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]/80">
                Workspace
              </p>
            ) : null}
            {workspaceItems.map(renderNavItem)}
          </div>

          <div className="space-y-1">
            {!collapsed ? (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]/80">
                Library & Ops
              </p>
            ) : (
              <div className="mx-3 my-1 border-t border-[var(--color-hairline)]" />
            )}
            {libraryItems.map(renderNavItem)}
          </div>

          {services.length > 0 ? (
            <div className="space-y-1">
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => setServicesOpen((open) => !open)}
                  className="flex w-full cursor-pointer items-center justify-between px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]/80 transition-colors hover:text-[var(--color-foreground)]"
                  aria-expanded={servicesOpen}
                >
                  <span>Services ({services.length})</span>
                  {servicesOpen ? (
                    <ChevronDown className="size-3" aria-hidden />
                  ) : (
                    <ChevronRight className="size-3" aria-hidden />
                  )}
                </button>
              ) : (
                <div className="mx-3 my-1 border-t border-[var(--color-hairline)]" />
              )}

              {collapsed || servicesOpen ? (
                <div className="space-y-0.5">
                  {services.map((service) => {
                    const to = `/service/${service.id}`
                    const active = location.pathname === to
                    const state = health[service.id]
                    const statusDot =
                      !state || state.status === 'idle' || state.status === 'loading'
                        ? 'bg-[var(--color-muted-foreground)]/50'
                        : state.status === 'success'
                          ? 'bg-[var(--color-success)]'
                          : 'bg-[var(--color-destructive)]'

                    return (
                      <NavLink
                        key={service.id}
                        to={to}
                        title={collapsed ? service.name || service.type : undefined}
                        className={cn(
                          'relative flex min-h-9 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-xs font-medium transition-colors active:scale-[0.98]',
                          collapsed && 'justify-center px-0',
                          active
                            ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                            : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]',
                        )}
                      >
                        {collapsed ? (
                          <span className="relative inline-flex items-center justify-center">
                            <Server
                              className="size-4"
                              style={{ color: serviceAccent(service.type) }}
                              aria-hidden
                            />
                            <span
                              className={cn(
                                'absolute -right-1 -top-1 size-2 rounded-full ring-2 ring-[var(--color-card)]',
                                statusDot,
                              )}
                            />
                          </span>
                        ) : (
                          <>
                            <span
                              className={cn('size-2 shrink-0 rounded-full', statusDot)}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {service.name || service.type}
                            </span>
                            <span
                              className="size-1.5 shrink-0 rounded-full opacity-75"
                              style={{ background: serviceAccent(service.type) }}
                              aria-hidden
                            />
                          </>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>
      </LayoutGroup>

      <div className="space-y-1 border-t border-[var(--color-hairline)] p-2.5">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex min-h-9 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors active:scale-[0.98]',
            collapsed && 'justify-center px-0',
            settingsActive
              ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
              : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]',
          )}
        >
          <Settings className="size-[18px]" aria-hidden />
          {!collapsed ? <span>Settings</span> : null}
        </NavLink>

        {onShortcutsClick ? (
          <button
            type="button"
            onClick={onShortcutsClick}
            title={collapsed ? 'Keyboard shortcuts (?)' : undefined}
            className={cn(
              'flex min-h-9 w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] active:scale-[0.98]',
              collapsed && 'justify-center px-0',
            )}
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="size-[18px]" aria-hidden />
            {!collapsed ? (
              <>
                <span className="flex-1 text-left">Shortcuts</span>
                <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted-foreground)]">
                  ?
                </kbd>
              </>
            ) : null}
          </button>
        ) : null}

        <button
          type="button"
          onClick={toggleTheme}
          title={collapsed ? (isLight ? 'Switch to dark mode' : 'Switch to light mode') : undefined}
          className={cn(
            'flex min-h-9 w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] active:scale-[0.98]',
            collapsed && 'justify-center px-0',
          )}
          aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {isLight ? <Moon className="size-[18px]" aria-hidden /> : <Sun className="size-[18px]" aria-hidden />}
          {!collapsed ? <span>{isLight ? 'Dark mode' : 'Light mode'}</span> : null}
        </button>

        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex min-h-9 w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] active:scale-[0.98]',
            collapsed && 'justify-center px-0',
          )}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <ChevronsRight className="size-[18px]" /> : <ChevronsLeft className="size-[18px]" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  )
}
