import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { DashboardWidgetConfig, DashboardWidgetId } from '@/lib/dashboard/dashboard.types'
import { useDashboardStore } from '@/stores/dashboardStore'

export function useDashboardEditor() {
  const hydrated = useDashboardStore((state) => state.hydrated)
  const hydrate = useDashboardStore((state) => state.hydrate)
  const dashboards = useDashboardStore((state) => state.dashboards)
  const activeDashboardId = useDashboardStore((state) => state.activeDashboardId)
  const setActiveDashboard = useDashboardStore((state) => state.setActiveDashboard)
  const addDashboard = useDashboardStore((state) => state.addDashboard)
  const renameDashboard = useDashboardStore((state) => state.renameDashboard)
  const updateTagline = useDashboardStore((state) => state.updateTagline)
  const deleteDashboard = useDashboardStore((state) => state.deleteDashboard)
  const reorderWidget = useDashboardStore((state) => state.reorderWidget)
  const moveWidgetToTop = useDashboardStore((state) => state.moveWidgetToTop)
  const setWidgetsOrder = useDashboardStore((state) => state.setWidgetsOrder)
  const toggleWidget = useDashboardStore((state) => state.toggleWidget)
  const resetDashboards = useDashboardStore((state) => state.resetDashboards)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

  const active = useMemo(
    () => dashboards.find((item) => item.id === activeDashboardId) ?? dashboards[0],
    [activeDashboardId, dashboards],
  )

  const [draftName, setDraftName] = useState(active?.name ?? '')
  const [draftTagline, setDraftTagline] = useState(active?.tagline ?? '')

  useEffect(() => {
    setDraftName(active?.name ?? '')
    setDraftTagline(active?.tagline ?? '')
  }, [active?.id, active?.name, active?.tagline])

  function saveName() {
    if (!active) return
    const next = draftName.trim()
    if (!next || next === active.name) return
    renameDashboard(active.id, next)
    toast.success('Dashboard name saved')
  }

  function saveTagline() {
    if (!active) return
    const next = draftTagline.trim()
    if (next === (active.tagline ?? '').trim()) return
    updateTagline(active.id, next)
    toast.success(next ? 'Tagline saved' : 'Tagline cleared')
  }

  function onDelete() {
    if (!active || dashboards.length <= 1) return
    deleteDashboard(active.id)
    toast.success('Dashboard deleted')
  }

  function onReset() {
    resetDashboards()
    toast.success('Dashboards reset')
  }

  return {
    hydrated,
    dashboards,
    active,
    draftName,
    setDraftName,
    draftTagline,
    setDraftTagline,
    saveName,
    saveTagline,
    selectDashboard: setActiveDashboard,
    addDashboard: () => {
      addDashboard()
      toast.success('Dashboard added')
    },
    onDelete,
    onReset,
    canDelete: dashboards.length > 1,
    toggleWidget: (id: DashboardWidgetId) => {
      if (!active) return
      toggleWidget(active.id, id)
    },
    moveWidget: (id: DashboardWidgetId, direction: 'up' | 'down') => {
      if (!active) return
      reorderWidget(active.id, id, direction)
    },
    moveWidgetToTop: (id: DashboardWidgetId) => {
      if (!active) return
      moveWidgetToTop(active.id, id)
    },
    setWidgetsOrder: (widgets: DashboardWidgetConfig[]) => {
      if (!active) return
      setWidgetsOrder(active.id, widgets)
    },
  }
}
