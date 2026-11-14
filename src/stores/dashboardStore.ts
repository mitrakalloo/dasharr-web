import { create } from 'zustand'

import {
  DASHBOARD_LAYOUT_VERSION,
  createDashboardId,
  defaultDashboards,
} from '@/lib/dashboard/dashboard.defaults'
import {
  moveWidget,
  moveWidgetToTop,
  normalizeDashboards,
  toggleWidget,
} from '@/lib/dashboard/dashboard.helpers'
import type {
  DashboardPreferences,
  DashboardWidgetId,
  HomeDashboard,
} from '@/lib/dashboard/dashboard.types'

const STORAGE_KEY = 'dasharr.dashboards.v1'

interface DashboardState {
  dashboards: HomeDashboard[]
  activeDashboardId: string
  layoutVersion: number
  hydrated: boolean
  hydrate: () => void
  setActiveDashboard: (id: string) => void
  addDashboard: (name?: string) => void
  renameDashboard: (id: string, name: string) => void
  updateTagline: (id: string, tagline: string) => void
  deleteDashboard: (id: string) => void
  reorderWidget: (dashboardId: string, widgetId: DashboardWidgetId, direction: 'up' | 'down') => void
  moveWidgetToTop: (dashboardId: string, widgetId: DashboardWidgetId) => void
  toggleWidget: (dashboardId: string, widgetId: DashboardWidgetId) => void
  resetDashboards: () => void
}

function persist(state: Pick<DashboardState, 'dashboards' | 'activeDashboardId' | 'layoutVersion'>) {
  const payload: DashboardPreferences = {
    version: 1,
    layoutVersion: state.layoutVersion,
    dashboards: state.dashboards,
    activeDashboardId: state.activeDashboardId,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

function loadStored(): DashboardPreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DashboardPreferences
  } catch {
    return null
  }
}

const seeded = defaultDashboards()

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: seeded,
  activeDashboardId: seeded[0].id,
  layoutVersion: DASHBOARD_LAYOUT_VERSION,
  hydrated: false,

  hydrate: () => {
    const stored = loadStored()
    const syncPresets =
      !stored || (stored.layoutVersion ?? 0) < DASHBOARD_LAYOUT_VERSION
    const normalized = normalizeDashboards(
      stored?.dashboards,
      stored?.activeDashboardId,
      { syncPresets },
    )
    const next = {
      dashboards: normalized.dashboards,
      activeDashboardId: normalized.activeDashboardId,
      layoutVersion: DASHBOARD_LAYOUT_VERSION,
      hydrated: true,
    }
    set(next)
    persist(next)
  },

  setActiveDashboard: (id) => {
    if (!get().dashboards.some((item) => item.id === id)) return
    set({ activeDashboardId: id })
    persist(get())
  },

  addDashboard: (name) => {
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
    persist(get())
  },

  renameDashboard: (id, name) => {
    const next = name.trim()
    if (!next) return
    set((state) => ({
      dashboards: state.dashboards.map((item) =>
        item.id === id ? { ...item, name: next } : item,
      ),
    }))
    persist(get())
  },

  updateTagline: (id, tagline) => {
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
    persist(get())
  },

  deleteDashboard: (id) => {
    const { dashboards, activeDashboardId } = get()
    if (dashboards.length <= 1) return
    const next = dashboards.filter((item) => item.id !== id)
    set({
      dashboards: next,
      activeDashboardId:
        activeDashboardId === id ? next[0].id : activeDashboardId,
    })
    persist(get())
  },

  reorderWidget: (dashboardId, widgetId, direction) => {
    set((state) => ({
      dashboards: state.dashboards.map((item) =>
        item.id === dashboardId
          ? { ...item, widgets: moveWidget(item.widgets, widgetId, direction) }
          : item,
      ),
    }))
    persist(get())
  },

  moveWidgetToTop: (dashboardId, widgetId) => {
    set((state) => ({
      dashboards: state.dashboards.map((item) =>
        item.id === dashboardId
          ? { ...item, widgets: moveWidgetToTop(item.widgets, widgetId) }
          : item,
      ),
    }))
    persist(get())
  },

  toggleWidget: (dashboardId, widgetId) => {
    set((state) => ({
      dashboards: state.dashboards.map((item) =>
        item.id === dashboardId
          ? { ...item, widgets: toggleWidget(item.widgets, widgetId) }
          : item,
      ),
    }))
    persist(get())
  },

  resetDashboards: () => {
    const dashboards = defaultDashboards()
    const next = {
      dashboards,
      activeDashboardId: dashboards[0].id,
      layoutVersion: DASHBOARD_LAYOUT_VERSION,
    }
    set({ ...next, hydrated: true })
    persist(next)
  },
}))
