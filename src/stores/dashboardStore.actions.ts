import {
  DASHBOARD_LAYOUT_VERSION,
  createDashboardId,
  defaultDashboards,
} from '@/lib/dashboard/dashboard.defaults'
import {
  moveWidget,
  moveWidgetToTop,
  toggleWidget,
} from '@/lib/dashboard/dashboard.helpers'
import type { DashboardWidgetId, HomeDashboard } from '@/lib/dashboard/dashboard.types'
import {
  scheduleDashboardPut,
  toDashboardPayload,
} from '@/stores/dashboardStore.sync'

export interface DashboardMutable {
  dashboards: HomeDashboard[]
  activeDashboardId: string
  layoutVersion: number
  hydrated: boolean
}

type SetState = (
  partial: Partial<DashboardMutable> | ((state: DashboardMutable) => Partial<DashboardMutable>),
) => void
type GetState = () => DashboardMutable

function sync(get: GetState) {
  scheduleDashboardPut(toDashboardPayload(get()))
}

export function createDashboardMutations(set: SetState, get: GetState) {
  return {
    setActiveDashboard: (id: string) => {
      if (!get().dashboards.some((item) => item.id === id)) return
      set({ activeDashboardId: id })
      sync(get)
    },

    addDashboard: (name?: string) => {
      const template = defaultDashboards()[0]
      const dashboard: HomeDashboard = {
        id: createDashboardId(),
        name: name?.trim() || `Dashboard ${get().dashboards.length + 1}`,
        tagline: template.tagline,
        widgets: template.widgets.map((widget) => ({ ...widget })),
      }
      set((state) => ({
        dashboards: [...state.dashboards, dashboard],
        activeDashboardId: dashboard.id,
      }))
      sync(get)
    },

    renameDashboard: (id: string, name: string) => {
      const next = name.trim()
      if (!next) return
      set((state) => ({
        dashboards: state.dashboards.map((item) =>
          item.id === id ? { ...item, name: next } : item,
        ),
      }))
      sync(get)
    },

    updateTagline: (id: string, tagline: string) => {
      const next = tagline.trim()
      set((state) => ({
        dashboards: state.dashboards.map((item) =>
          item.id === id
            ? next
              ? { ...item, tagline: next }
              : { id: item.id, name: item.name, widgets: item.widgets }
            : item,
        ),
      }))
      sync(get)
    },

    deleteDashboard: (id: string) => {
      const { dashboards, activeDashboardId } = get()
      if (dashboards.length <= 1) return
      const next = dashboards.filter((item) => item.id !== id)
      set({
        dashboards: next,
        activeDashboardId: activeDashboardId === id ? next[0].id : activeDashboardId,
      })
      sync(get)
    },

    reorderWidget: (
      dashboardId: string,
      widgetId: DashboardWidgetId,
      direction: 'up' | 'down',
    ) => {
      set((state) => ({
        dashboards: state.dashboards.map((item) =>
          item.id === dashboardId
            ? { ...item, widgets: moveWidget(item.widgets, widgetId, direction) }
            : item,
        ),
      }))
      sync(get)
    },

    moveWidgetToTop: (dashboardId: string, widgetId: DashboardWidgetId) => {
      set((state) => ({
        dashboards: state.dashboards.map((item) =>
          item.id === dashboardId
            ? { ...item, widgets: moveWidgetToTop(item.widgets, widgetId) }
            : item,
        ),
      }))
      sync(get)
    },

    toggleWidget: (dashboardId: string, widgetId: DashboardWidgetId) => {
      set((state) => ({
        dashboards: state.dashboards.map((item) =>
          item.id === dashboardId
            ? { ...item, widgets: toggleWidget(item.widgets, widgetId) }
            : item,
        ),
      }))
      sync(get)
    },

    resetDashboards: () => {
      const dashboards = defaultDashboards()
      set({
        dashboards,
        activeDashboardId: dashboards[0].id,
        layoutVersion: DASHBOARD_LAYOUT_VERSION,
        hydrated: true,
      })
      sync(get)
    },
  }
}
