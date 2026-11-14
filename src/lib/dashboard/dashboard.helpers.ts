import { DASHBOARD_WIDGET_META } from '@/lib/dashboard/dashboard.meta'
import {
  createDashboardId,
  defaultDashboards,
} from '@/lib/dashboard/dashboard.defaults'
import type {
  DashboardWidgetConfig,
  DashboardWidgetId,
  HomeDashboard,
} from '@/lib/dashboard/dashboard.types'

const ALL_IDS = DASHBOARD_WIDGET_META.map((item) => item.id)
const LEGACY_PRESET_IDS = new Set(['overview', 'downloads', 'schedule'])

export function moveWidget(
  widgets: DashboardWidgetConfig[],
  id: DashboardWidgetId,
  direction: 'up' | 'down',
): DashboardWidgetConfig[] {
  const index = widgets.findIndex((widget) => widget.id === id)
  if (index < 0) return widgets
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= widgets.length) return widgets
  const next = [...widgets]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function moveWidgetToTop(
  widgets: DashboardWidgetConfig[],
  id: DashboardWidgetId,
): DashboardWidgetConfig[] {
  const index = widgets.findIndex((widget) => widget.id === id)
  if (index <= 0) return widgets
  const next = [...widgets]
  const [item] = next.splice(index, 1)
  next.unshift(item)
  return next
}

export function toggleWidget(
  widgets: DashboardWidgetConfig[],
  id: DashboardWidgetId,
): DashboardWidgetConfig[] {
  return widgets.map((widget) =>
    widget.id === id ? { ...widget, enabled: !widget.enabled } : widget,
  )
}

export function widgetLabel(id: DashboardWidgetId): string {
  return DASHBOARD_WIDGET_META.find((item) => item.id === id)?.label ?? id
}

function mapLegacyActiveId(id: string | undefined): string | undefined {
  if (!id) return undefined
  if (id === 'overview' || id === 'schedule') return 'tonight'
  if (id === 'downloads') return 'ops'
  return undefined
}

function normalizeDashboard(
  dashboard: HomeDashboard,
  defaults: HomeDashboard[],
): HomeDashboard {
  const preset = defaults.find((item) => item.id === dashboard.id)
  const seen = new Set<DashboardWidgetId>()
  const widgets: DashboardWidgetConfig[] = []
  for (const widget of dashboard.widgets ?? []) {
    if (!ALL_IDS.includes(widget.id) || seen.has(widget.id)) continue
    seen.add(widget.id)
    widgets.push({ id: widget.id, enabled: Boolean(widget.enabled) })
  }
  for (const id of ALL_IDS) {
    if (seen.has(id)) continue
    const presetEnabled = preset?.widgets.find((widget) => widget.id === id)?.enabled ?? false
    widgets.push({ id, enabled: presetEnabled })
  }
  const tagline = dashboard.tagline?.trim() || preset?.tagline || ''
  return {
    id: dashboard.id || createDashboardId(),
    name: dashboard.name?.trim() || preset?.name || 'Dashboard',
    ...(tagline ? { tagline } : {}),
    widgets,
  }
}

export function normalizeDashboards(
  dashboards: HomeDashboard[] | undefined,
  activeDashboardId?: string,
  options?: { syncPresets?: boolean },
): { dashboards: HomeDashboard[]; activeDashboardId: string } {
  const defaults = defaultDashboards()
  const defaultIds = new Set(defaults.map((item) => item.id))

  if (options?.syncPresets) {
    const existing = Array.isArray(dashboards) ? dashboards : []
    const customs = existing
      .filter((item) => !defaultIds.has(item.id) && !LEGACY_PRESET_IDS.has(item.id))
      .map((item) => normalizeDashboard(item, defaults))
    const list = [
      ...defaults.map((item) => ({
        ...item,
        widgets: item.widgets.map((widget) => ({ ...widget })),
      })),
      ...customs,
    ]
    const preferred =
      activeDashboardId && list.some((item) => item.id === activeDashboardId)
        ? activeDashboardId
        : (mapLegacyActiveId(activeDashboardId) ?? defaults[0].id)
    return { dashboards: list, activeDashboardId: preferred }
  }

  const list =
    Array.isArray(dashboards) && dashboards.length > 0
      ? dashboards.map((item) => normalizeDashboard(item, defaults))
      : defaults.map((item) => normalizeDashboard(item, defaults))

  const seen = new Set(list.map((item) => item.id))
  for (const fallback of defaults) {
    if (!seen.has(fallback.id)) list.push(normalizeDashboard(fallback, defaults))
  }

  const legacy = mapLegacyActiveId(activeDashboardId)
  const active =
    activeDashboardId && list.some((item) => item.id === activeDashboardId)
      ? activeDashboardId
      : legacy && list.some((item) => item.id === legacy)
        ? legacy
        : list[0].id

  return { dashboards: list, activeDashboardId: active }
}
