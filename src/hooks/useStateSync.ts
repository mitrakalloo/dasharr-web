import { useEffect } from 'react'

import { useDashboardStore } from '@/stores/dashboardStore'
import { usePrefsStore } from '@/stores/prefsStore'

/** Rehydrate prefs/dashboard when another device writes to the server. */
export function useStateSync(enabled: boolean) {
  const hydratePrefs = usePrefsStore((state) => state.hydrateFromServer)
  const hydrateDashboard = useDashboardStore((state) => state.hydrateFromServer)

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return

    const source = new EventSource('/api/state/events')
    const onPrefs = () => {
      void hydratePrefs()
    }
    const onDashboard = () => {
      void hydrateDashboard()
    }
    source.addEventListener('prefs', onPrefs)
    source.addEventListener('dashboard', onDashboard)

    return () => {
      source.removeEventListener('prefs', onPrefs)
      source.removeEventListener('dashboard', onDashboard)
      source.close()
    }
  }, [enabled, hydratePrefs, hydrateDashboard])
}
