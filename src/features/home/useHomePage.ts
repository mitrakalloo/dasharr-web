import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useOverviewSections } from '@/features/overview/useOverviewSections'
import type { DemoQueueItem, DemoSeerrRequest } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'
import { useStackHealth } from '@/hooks/useStackHealth'
import { useTautulliSessions } from '@/hooks/useTautulliSessions'
import { useConfigStore } from '@/stores/configStore'
import { useDashboardStore } from '@/stores/dashboardStore'

export function useHomePage() {
  const navigate = useNavigate()
  const overview = useOverviewSections()
  const seerr = useSeerrRequests(!overview.isDemo && overview.showSeerr)
  const watching = useTautulliSessions(!overview.isDemo && overview.showWatching)
  const stackHealth = useStackHealth()

  const hydrated = useDashboardStore((state) => state.hydrated)
  const hydrate = useDashboardStore((state) => state.hydrate)
  const dashboards = useDashboardStore((state) => state.dashboards)
  const activeDashboardId = useDashboardStore((state) => state.activeDashboardId)
  const setActiveDashboard = useDashboardStore((state) => state.setActiveDashboard)

  const [serviceFilter, setServiceFilter] = useState<string | undefined>()
  const [selected, setSelected] = useState<DemoQueueItem | null>(null)
  const [seerrRequest, setSeerrRequest] = useState<DemoSeerrRequest | null>(null)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

  const active =
    dashboards.find((item) => item.id === activeDashboardId) ?? dashboards[0]

  const enabledWidgets = useMemo(
    () => (active?.widgets ?? []).filter((widget) => widget.enabled),
    [active],
  )

  const onlineCount = overview.isDemo ? 4 : stackHealth.online

  const pendingRequests =
    seerr.status === 'success'
      ? seerr.data.filter((item) => item.status === 'pending').length
      : 0

  const ribbon = [
    {
      label: 'Downloads',
      value: String(overview.queuePreview.length),
      to: '/queue?filter=downloading',
      accent: '#60A5FA',
    },
    {
      label: 'Waiting approval',
      value: String(pendingRequests),
      to: '/queue?filter=requests',
      accent: '#F59E0B',
    },
    {
      label: 'Now playing',
      value: String(watching.items.length),
      to: '/queue?filter=watching',
      accent: '#2DD4BF',
    },
    {
      label: 'Online',
      value: String(onlineCount),
      to: '/more',
      accent: '#34D399',
    },
  ]

  function openItem(item: DemoQueueItem) {
    if (item.titleId) {
      navigate(titlePath(item.titleId))
      return
    }
    setSelected(item)
  }

  function handleServiceSelect(id: string) {
    const configured = useConfigStore.getState().services.find((s) => s.id === id)
    if (configured?.type === 'seerr' || id === 'seerr') {
      navigate('/requests')
      return
    }
    if (configured) {
      navigate(`/service/${configured.id}`)
      return
    }
    setServiceFilter(id === serviceFilter ? undefined : id)
  }

  return {
    overview,
    seerr,
    dashboards,
    active,
    enabledWidgets,
    ribbon,
    serviceFilter,
    selected,
    setSelected,
    seerrRequest,
    setSeerrRequest,
    setActiveDashboard,
    openItem,
    handleServiceSelect,
    ready: overview.hydrated && hydrated,
  }
}
