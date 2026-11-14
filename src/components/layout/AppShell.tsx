import { Outlet } from 'react-router-dom'

import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { QueueSidebar } from '@/components/layout/QueueSidebar'
import { SideNavRail } from '@/components/layout/SideNavRail'
import { TopBar } from '@/components/layout/TopBar'
import { useAppShell } from '@/components/layout/useAppShell'
import { CommandPalette } from '@/features/command/CommandPalette'
import { HealthSheet } from '@/features/overview/HealthSheet'
import { AddMediaSheet } from '@/features/search/AddMediaSheet'
import { cn } from '@/lib/cn'
import { useSheetOpen } from '@/stores/sheetStore'

export function AppShell() {
  const sheetOpen = useSheetOpen()
  const shell = useAppShell()

  return (
    <div className="flex h-dvh overflow-x-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      {!shell.hideChrome ? (
        <SideNavRail
          collapsed={shell.railCollapsed}
          onCollapsedChange={shell.setRailCollapsed}
          queueBadge={shell.activeQueue}
        />
      ) : null}

      <div
        className={cn(
          'app-shell flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-background)]',
          'mx-auto w-full max-w-[var(--shell-max)] border-x border-[var(--color-border)] lg:mx-0 lg:max-w-none lg:border-x-0',
        )}
        data-sheet-open={sheetOpen ? 'true' : 'false'}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {!shell.hideChrome ? (
              <TopBar
                healthLabel={shell.stackHealth.label}
                healthTone={shell.stackHealth.tone}
                downloadSpeed={shell.downloadSpeed}
                onHealthClick={() => shell.setHealthOpen(true)}
                onAddClick={() => shell.setCommandOpen(true)}
                scrollTarget={shell.scrollEl}
              />
            ) : null}

            <main
              ref={shell.setScrollEl}
              className={cn(
                'no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
                shell.hideChrome
                  ? 'pb-8'
                  : 'pb-[var(--tab-clearance)] lg:pb-6',
              )}
            >
              <Outlet />
            </main>

            {!shell.hideChrome ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 lg:hidden">
                <BottomTabBar queueBadge={shell.activeQueue} />
              </div>
            ) : null}
          </div>

          {shell.showQueueSidebar ? <QueueSidebar /> : null}
        </div>
      </div>

      <HealthSheet open={shell.healthOpen} onClose={() => shell.setHealthOpen(false)} />
      <AddMediaSheet open={shell.addOpen} onClose={() => shell.setAddOpen(false)} />
      <CommandPalette
        open={shell.commandOpen}
        onOpenChange={shell.setCommandOpen}
        onAddMedia={() => {
          shell.setCommandOpen(false)
          shell.setAddOpen(true)
        }}
      />
    </div>
  )
}

/** @deprecated Prefer AppShell — kept for import compatibility during rename. */
export { AppShell as MobileShell }
