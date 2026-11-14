import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { PRIMARY_NAV, RAIL_COLLAPSED_KEY } from '@/components/layout/nav.constants'
import { DEMO_QUEUE } from '@/data/demoDashboard'
import { useAggregateDownloadSpeed } from '@/hooks/useAggregateDownloadSpeed'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useStackHealth } from '@/hooks/useStackHealth'

const QUEUE_SIDEBAR_PATHS = new Set(['/', '/queue', '/calendar', '/requests', '/wanted', '/more'])

export function useAppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const stackHealth = useStackHealth()
  const { isDemo } = useConfiguredStack()
  const liveQueue = useDownloadQueue(!isDemo)
  const downloadSpeed = useAggregateDownloadSpeed()

  const [healthOpen, setHealthOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
  const [railCollapsed, setRailCollapsed] = useState(() => {
    try {
      return localStorage.getItem(RAIL_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  const hideChrome =
    location.pathname.startsWith('/settings') || location.pathname.startsWith('/title/')
  const showQueueSidebar =
    isDesktop && !hideChrome && QUEUE_SIDEBAR_PATHS.has(location.pathname)

  const activeQueue = useMemo(
    () =>
      isDemo
        ? DEMO_QUEUE.filter((item) => item.status !== 'paused').length
        : liveQueue.activeCount,
    [isDemo, liveQueue.activeCount],
  )

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if (typing) return

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return
      const match = PRIMARY_NAV.find((item) => item.shortcut === event.key)
      if (match) {
        event.preventDefault()
        navigate(match.to)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return {
    hideChrome,
    showQueueSidebar,
    healthOpen,
    setHealthOpen,
    addOpen,
    setAddOpen,
    commandOpen,
    setCommandOpen,
    scrollEl,
    setScrollEl,
    railCollapsed,
    setRailCollapsed,
    activeQueue,
    downloadSpeed,
    stackHealth,
  }
}
