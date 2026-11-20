import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { PageTransition } from '@/components/layout/PageTransition'
import { QueueSidebar } from '@/components/layout/QueueSidebar'
import { ShortcutsModal } from '@/components/layout/ShortcutsModal'
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
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-transparent text-[var(--color-foreground)]">
      {!shell.hideSideNav ? (
        <SideNavRail
          collapsed={shell.railCollapsed}
          onCollapsedChange={shell.setRailCollapsed}
          onShortcutsClick={() => shell.setShortcutsOpen(true)}
          queueBadge={shell.activeQueue}
          requestsBadge={shell.pendingRequests}
        />
      ) : null}

      <div
        className="app-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent"
        data-sheet-open={sheetOpen ? 'true' : 'false'}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {!shell.hideTopBar ? (
              <TopBar
                title={shell.routeMeta.title}
                subtitle={shell.routeMeta.subtitle}
                healthLabel={shell.stackHealth.label}
                healthTone={shell.stackHealth.tone}
                warningsCount={shell.warningsCount}
                downloadSpeed={shell.downloadSpeed}
                onHealthClick={() => shell.setHealthOpen(true)}
                onAddMedia={() => shell.setAddOpen(true)}
                onCommand={() => shell.setCommandOpen(true)}
                scrollTarget={shell.scrollEl}
              />
            ) : null}

            <main
              ref={shell.setScrollEl}
              className={cn(
                'scroll-pane custom-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
                shell.hideBottomNav
                  ? 'pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]'
                  : 'pb-4',
              )}
            >
              <PageTransition />
            </main>

            {!shell.hideBottomNav ? (
              <BottomTabBar queueBadge={shell.activeQueue} requestsBadge={shell.pendingRequests} />
            ) : null}
          </div>

          {shell.showQueueSidebar ? <QueueSidebar /> : null}
        </div>
      </div>

      <HealthSheet
        open={shell.healthOpen}
        onClose={() => shell.setHealthOpen(false)}
        pendingRequests={shell.pendingRequests}
      />
      <AddMediaSheet open={shell.addOpen} onClose={() => shell.setAddOpen(false)} />
      <ShortcutsModal
        open={shell.shortcutsOpen}
        onClose={() => shell.setShortcutsOpen(false)}
      />
      <CommandPalette
        open={shell.commandOpen}
        onOpenChange={shell.setCommandOpen}
        onAddMedia={() => {
          shell.setCommandOpen(false)
          shell.setAddOpen(true)
        }}
        onOpenHealth={() => {
          shell.setCommandOpen(false)
          shell.setHealthOpen(true)
        }}
        onOpenShortcuts={() => {
          shell.setCommandOpen(false)
          shell.setShortcutsOpen(true)
        }}
      />
    </div>
  )
}

/** @deprecated Prefer AppShell — kept for import compatibility during rename. */
export { AppShell as MobileShell }
