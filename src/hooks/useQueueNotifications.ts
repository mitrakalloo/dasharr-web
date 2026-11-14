import { useEffect, useRef } from 'react'

import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { usePrefsStore } from '@/stores/prefsStore'

/** Fires a browser notification when active download count drops. */
export function useQueueNotifications() {
  const { isDemo } = useConfiguredStack()
  const enabled = usePrefsStore((state) => state.experience.notificationsEnabled)
  const queue = useDownloadQueue(!isDemo && enabled)
  const prev = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || isDemo || typeof Notification === 'undefined') return
    if (Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }, [enabled, isDemo])

  useEffect(() => {
    if (!enabled || isDemo || Notification.permission !== 'granted') return
    const active = queue.activeCount
    if (prev.current != null && prev.current > 0 && active === 0) {
      try {
        new Notification('Dasharr', { body: 'Download queue finished.' })
      } catch {
        // ignore
      }
    }
    prev.current = active
  }, [enabled, isDemo, queue.activeCount])
}
