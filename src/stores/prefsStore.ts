import { create } from 'zustand'

import {
  DEFAULT_ADD_PREFS,
  DEFAULT_EXPERIENCE,
  type AppPreferences,
  type DefaultAddPrefs,
  type ExperiencePrefs,
} from '@/lib/prefs/prefs.types'
import { useDashboardStore } from '@/stores/dashboardStore'

const STORAGE_KEY = 'dasharr.preferences.v1'
export const PREFERENCES_EXPORT_KIND = 'dasharr.preferences' as const

interface PrefsState {
  defaultAdd: DefaultAddPrefs
  experience: ExperiencePrefs
  hydrated: boolean
  hydrate: () => void
  setDefaultAdd: (patch: Partial<DefaultAddPrefs>) => void
  setExperience: (patch: Partial<ExperiencePrefs>) => void
  exportPreferences: () => string
  importPreferences: (raw: string) => void
}

function persist(state: Pick<PrefsState, 'defaultAdd' | 'experience'>) {
  const payload = {
    version: 1 as const,
    defaultAdd: state.defaultAdd,
    experience: state.experience,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

function load(): { defaultAdd: DefaultAddPrefs; experience: ExperiencePrefs } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<{
      defaultAdd: DefaultAddPrefs
      experience: ExperiencePrefs
    }>
    return {
      defaultAdd: { ...DEFAULT_ADD_PREFS, ...parsed.defaultAdd },
      experience: { ...DEFAULT_EXPERIENCE, ...parsed.experience },
    }
  } catch {
    return null
  }
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
  defaultAdd: DEFAULT_ADD_PREFS,
  experience: DEFAULT_EXPERIENCE,
  hydrated: false,

  hydrate: () => {
    const stored = load()
    set({
      defaultAdd: stored?.defaultAdd ?? DEFAULT_ADD_PREFS,
      experience: stored?.experience ?? DEFAULT_EXPERIENCE,
      hydrated: true,
    })
  },

  setDefaultAdd: (patch) => {
    set((state) => ({ defaultAdd: { ...state.defaultAdd, ...patch } }))
    persist(get())
  },

  setExperience: (patch) => {
    set((state) => ({ experience: { ...state.experience, ...patch } }))
    persist(get())
  },

  exportPreferences: () => {
    const dash = useDashboardStore.getState()
    const envelope: AppPreferences = {
      version: 1,
      kind: PREFERENCES_EXPORT_KIND,
      exportedAt: new Date().toISOString(),
      defaultAdd: get().defaultAdd,
      experience: get().experience,
      dashboards: dash.dashboards,
      activeDashboardId: dash.activeDashboardId,
      dashboardLayoutVersion: dash.layoutVersion,
    }
    return JSON.stringify(envelope, null, 2)
  },

  importPreferences: (raw) => {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const prefs =
      parsed.kind === PREFERENCES_EXPORT_KIND && parsed.preferences
        ? (parsed.preferences as Record<string, unknown>)
        : parsed.kind === PREFERENCES_EXPORT_KIND
          ? parsed
          : parsed

    if (prefs.defaultAdd && typeof prefs.defaultAdd === 'object') {
      set((state) => ({
        defaultAdd: { ...state.defaultAdd, ...(prefs.defaultAdd as DefaultAddPrefs) },
      }))
    }
    if (prefs.experience && typeof prefs.experience === 'object') {
      set((state) => ({
        experience: { ...state.experience, ...(prefs.experience as ExperiencePrefs) },
      }))
    } else {
      // bare native-style fields
      const experiencePatch: Partial<ExperiencePrefs> = {}
      for (const key of Object.keys(DEFAULT_EXPERIENCE) as Array<keyof ExperiencePrefs>) {
        if (key in prefs) {
          ;(experiencePatch as Record<string, unknown>)[key] = prefs[key]
        }
      }
      if (Object.keys(experiencePatch).length > 0) {
        set((state) => ({ experience: { ...state.experience, ...experiencePatch } }))
      }
      if (prefs.defaultAdd == null && 'monitored' in prefs) {
        set((state) => ({
          defaultAdd: {
            ...state.defaultAdd,
            ...(prefs as Partial<DefaultAddPrefs>),
          },
        }))
      }
    }

    if (Array.isArray(prefs.dashboards)) {
      const dash = useDashboardStore.getState()
      // rehydrate dashboards via reset + set — use store API
      const list = prefs.dashboards as ReturnType<typeof useDashboardStore.getState>['dashboards']
      const active =
        typeof prefs.activeDashboardId === 'string'
          ? prefs.activeDashboardId
          : list[0]?.id
      useDashboardStore.setState({
        dashboards: list,
        activeDashboardId: active ?? dash.activeDashboardId,
        hydrated: true,
      })
      try {
        localStorage.setItem(
          'dasharr.dashboards.v1',
          JSON.stringify({
            version: 1,
            layoutVersion: prefs.dashboardLayoutVersion ?? dash.layoutVersion,
            dashboards: list,
            activeDashboardId: active,
          }),
        )
      } catch {
        // ignore
      }
    }

    persist(get())
  },
}))
