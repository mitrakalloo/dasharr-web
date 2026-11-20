import { create } from 'zustand'

import {
  DASHBOARD_LAYOUT_VERSION,
  defaultDashboards,
} from '@/lib/dashboard/dashboard.defaults'
import type {
  DashboardWidgetConfig,
  DashboardWidgetId,
  HomeDashboard,
} from '@/lib/dashboard/dashboard.types'
import { createDashboardMutations } from '@/stores/dashboardStore.actions'
import { loadDashboardFromServer } from '@/stores/dashboardStore.sync'

interface DashboardState {
  dashboards: HomeDashboard[]
  activeDashboardId: string
  layoutVersion: number
  hydrated: boolean
  hydrateFromServer: () => Promise<void>
  hydrate: () => void
  setActiveDashboard: (id: string) => void
  addDashboard: (name?: string) => void
  renameDashboard: (id: string, name: string) => void
  updateTagline: (id: string, tagline: string) => void
  deleteDashboard: (id: string) => void
  reorderWidget: (dashboardId: string, widgetId: DashboardWidgetId, direction: 'up' | 'down') => void
  moveWidgetToTop: (dashboardId: string, widgetId: DashboardWidgetId) => void
  setWidgetsOrder: (dashboardId: string, widgets: DashboardWidgetConfig[]) => void
  toggleWidget: (dashboardId: string, widgetId: DashboardWidgetId) => void
  resetDashboards: () => void
}

const seeded = defaultDashboards()

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: seeded,
  activeDashboardId: seeded[0].id,
  layoutVersion: DASHBOARD_LAYOUT_VERSION,
  hydrated: false,

  hydrateFromServer: async () => {
    const next = await loadDashboardFromServer()
    set({ ...next, hydrated: true })
  },

  hydrate: () => undefined,

  ...createDashboardMutations(set, get),
}))
