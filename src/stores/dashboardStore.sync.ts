import { apiJson } from '@/lib/api/server'
import {
  DASHBOARD_LAYOUT_VERSION,
  defaultDashboards,
} from '@/lib/dashboard/dashboard.defaults'
import { normalizeDashboards } from '@/lib/dashboard/dashboard.helpers'
import type { DashboardPreferences } from '@/lib/dashboard/dashboard.types'
import { createDebouncedPut } from '@/lib/sync/debouncedPut'

const LOCAL_KEY = 'dasharr.dashboards.v1'
const putter = createDebouncedPut(450)

export function readLocalDashboard(): DashboardPreferences | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DashboardPreferences
  } catch {
    return null
  }
}

export function clearLocalDashboard() {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // ignore
  }
}

export function toDashboardPayload(state: {
  dashboards: DashboardPreferences['dashboards']
  activeDashboardId: string
  layoutVersion: number
}): DashboardPreferences {
  return {
    version: 1,
    layoutVersion: state.layoutVersion,
    dashboards: state.dashboards,
    activeDashboardId: state.activeDashboardId,
  }
}

export function scheduleDashboardPut(payload: DashboardPreferences) {
  putter.schedule(async () => {
    await apiJson('/api/state/dashboard', {
      method: 'PUT',
      body: JSON.stringify({ dashboard: payload }),
    })
  })
}

export async function flushDashboardPut() {
  await putter.flush()
}

export function normalizeLoaded(
  stored: DashboardPreferences | null,
): Pick<DashboardPreferences, 'dashboards' | 'activeDashboardId'> & {
  layoutVersion: number
} {
  const syncPresets = !stored || (stored.layoutVersion ?? 0) < DASHBOARD_LAYOUT_VERSION
  const normalized = normalizeDashboards(stored?.dashboards, stored?.activeDashboardId, {
    syncPresets,
  })
  return {
    dashboards: normalized.dashboards,
    activeDashboardId: normalized.activeDashboardId,
    layoutVersion: DASHBOARD_LAYOUT_VERSION,
  }
}

export async function loadDashboardFromServer(): Promise<
  ReturnType<typeof normalizeLoaded>
> {
  const remote = await apiJson<{ dashboard: DashboardPreferences | null }>(
    '/api/state/dashboard',
  )

  if (remote.dashboard) {
    clearLocalDashboard()
    return normalizeLoaded(remote.dashboard)
  }

  const local = readLocalDashboard()
  const next = normalizeLoaded(local ?? { ...toDashboardPayload({
    dashboards: defaultDashboards(),
    activeDashboardId: defaultDashboards()[0].id,
    layoutVersion: DASHBOARD_LAYOUT_VERSION,
  }) })

  await apiJson('/api/state/dashboard', {
    method: 'PUT',
    body: JSON.stringify({ dashboard: toDashboardPayload(next) }),
  })
  clearLocalDashboard()
  return next
}
