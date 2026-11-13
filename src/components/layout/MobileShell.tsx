import { Outlet, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { TopBar } from '@/components/layout/TopBar'
import { HealthSheet } from '@/features/overview/HealthSheet'
import { AddMediaSheet } from '@/features/search/AddMediaSheet'
import { DEMO_QUEUE } from '@/data/demoDashboard'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useStackHealth } from '@/hooks/useStackHealth'
import { cn } from '@/lib/cn'
import { useSheetOpen } from '@/stores/sheetStore'

export function MobileShell() {
  const location = useLocation()
  const sheetOpen = useSheetOpen()
  const stackHealth = useStackHealth()
  const { isDemo } = useConfiguredStack()
  const liveQueue = useDownloadQueue(!isDemo)
  const hideChrome =
    location.pathname.startsWith('/settings') || location.pathname.startsWith('/title/')
  const [healthOpen, setHealthOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)

  const activeQueue = useMemo(
    () =>
      isDemo
        ? DEMO_QUEUE.filter((item) => item.status !== 'paused').length
        : liveQueue.activeCount,
    [isDemo, liveQueue.activeCount],
  )

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050507] text-[var(--color-foreground)]">
      <div
        className={cn(
          'app-shell mx-auto flex h-dvh w-full max-w-[var(--shell-max)] flex-col overflow-hidden border-x border-[var(--color-border)] bg-[var(--color-background)] shadow-[0_0_80px_rgba(0,0,0,0.45)]',
        )}
        data-sheet-open={sheetOpen ? 'true' : 'false'}
      >
        {!hideChrome ? (
          <TopBar
            healthLabel={stackHealth.label}
            healthTone={stackHealth.tone}
            onHealthClick={() => setHealthOpen(true)}
            onAddClick={() => setAddOpen(true)}
            scrollTarget={scrollEl}
          />
        ) : null}

        <main
          ref={setScrollEl}
          className={cn(
            'min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
            hideChrome ? 'pb-8' : 'pb-4',
          )}
        >
          <Outlet />
        </main>

        {!hideChrome ? <BottomTabBar queueBadge={activeQueue} /> : null}
      </div>

      <HealthSheet open={healthOpen} onClose={() => setHealthOpen(false)} />
      <AddMediaSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
