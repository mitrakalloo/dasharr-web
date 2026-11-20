import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  G_CHORDS,
  PRIMARY_NAV,
  RAIL_COLLAPSED_KEY,
  routeMetaForPath,
} from '@/components/layout/nav.constants'
import { DEMO_QUEUE } from '@/data/demoDashboard'
import { useAggregateDownloadSpeed } from '@/hooks/useAggregateDownloadSpeed'
import { useArrHealthWarnings } from '@/hooks/useArrHealthWarnings'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'
import { useStackHealth } from '@/hooks/useStackHealth'

/** Show live queue sidebar on overview & operational pages (never duplicated on /queue itself). */
const QUEUE_SIDEBAR_PATHS = new Set([
  '/',
  '/calendar',
  '/requests',
  '/wanted',
  '/subtitles',
  '/activity',
  '/storage',
  '/more',
])

export function useAppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const stackHealth = useStackHealth()
  const { isDemo, has } = useConfiguredStack()
  const liveQueue = useDownloadQueue(!isDemo)
  const seerr = useSeerrRequests(!isDemo && has('seerr'))
  const arrHealth = useArrHealthWarnings(!isDemo)
  const downloadSpeed = useAggregateDownloadSpeed()

  const [healthOpen, setHealthOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
  const [railCollapsed, setRailCollapsed] = useState(() => {
    try {
      return localStorage.getItem(RAIL_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  const gChordActiveRef = useRef(false)
  const gChordTimerRef = useRef<number | null>(null)

  const onTitle = location.pathname.startsWith('/title/')
  const onSubpage =
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/edit-home') ||
    location.pathname.startsWith('/discover') ||
    location.pathname.startsWith('/manual-import') ||
    location.pathname.startsWith('/service/')

  const hideTopBar = onTitle || onSubpage
  const hideBottomNav = false
  const hideSideNav = false
  const showQueueSidebar =
    isDesktop && !onTitle && !onSubpage && QUEUE_SIDEBAR_PATHS.has(location.pathname)

  const routeMeta = useMemo(() => routeMetaForPath(location.pathname), [location.pathname])

  const activeQueue = useMemo(
    () =>
      isDemo
        ? DEMO_QUEUE.filter((item) => item.status !== 'paused').length
        : liveQueue.activeCount,
    [isDemo, liveQueue.activeCount],
  )

  const pendingRequests = useMemo(
    () =>
      seerr.status === 'success'
        ? seerr.data.filter((item) => item.status === 'pending').length
        : 0,
    [seerr],
  )

  useEffect(() => {
    scrollEl?.scrollTo({ top: 0 })
  }, [location.pathname, scrollEl])

  useEffect(() => {
    function clearChord() {
      gChordActiveRef.current = false
      if (gChordTimerRef.current !== null) {
        window.clearTimeout(gChordTimerRef.current)
        gChordTimerRef.current = null
      }
    }

    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      if (typing) return

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        clearChord()
        setCommandOpen((open) => !open)
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === '?') {
        event.preventDefault()
        clearChord()
        setShortcutsOpen((open) => !open)
        return
      }

      const lower = event.key.toLowerCase()

      if (gChordActiveRef.current) {
        const chord = G_CHORDS.find((item) => item.key === lower)
        clearChord()
        if (chord) {
          event.preventDefault()
          navigate(chord.to)
          return
        }
      }

      if (lower === 'g' && !event.shiftKey) {
        gChordActiveRef.current = true
        gChordTimerRef.current = window.setTimeout(() => {
          gChordActiveRef.current = false
          gChordTimerRef.current = null
        }, 900)
        return
      }

      const match = PRIMARY_NAV.find((item) => item.shortcut === event.key)
      if (match) {
        event.preventDefault()
        navigate(match.to)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearChord()
    }
  }, [navigate])

  return {
    hideTopBar,
    hideBottomNav,
    hideSideNav,
    showQueueSidebar,
    routeMeta,
    healthOpen,
    setHealthOpen,
    addOpen,
    setAddOpen,
    commandOpen,
    setCommandOpen,
    shortcutsOpen,
    setShortcutsOpen,
    scrollEl,
    setScrollEl,
    railCollapsed,
    setRailCollapsed,
    activeQueue,
    pendingRequests,
    warningsCount: arrHealth.count,
    downloadSpeed,
    stackHealth,
  }
}
