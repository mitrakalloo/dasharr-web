import { create } from 'zustand'

import {
  DEFAULT_ADD_PREFS,
  DEFAULT_EXPERIENCE,
  type AppPreferences,
  type DefaultAddPrefs,
  type ExperiencePrefs,
} from '@/lib/prefs/prefs.types'
import { useDashboardStore } from '@/stores/dashboardStore'
import { applyPreferencesImport } from '@/stores/prefsStore.import'
import {
  loadPrefsFromServer,
  schedulePrefsPut,
  type PrefsPayload,
} from '@/stores/prefsStore.sync'

export const PREFERENCES_EXPORT_KIND = 'dasharr.preferences' as const

interface PrefsState {
  defaultAdd: DefaultAddPrefs
  experience: ExperiencePrefs
  hydrated: boolean
  hydrateFromServer: () => Promise<void>
  hydrate: () => void
  setDefaultAdd: (patch: Partial<DefaultAddPrefs>) => void
  setExperience: (patch: Partial<ExperiencePrefs>) => void
  exportPreferences: () => string
  importPreferences: (raw: string) => void
}

function sync(get: () => PrefsState) {
  const payload: PrefsPayload = {
    version: 1,
    defaultAdd: get().defaultAdd,
    experience: get().experience,
  }
  schedulePrefsPut(payload)
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
  defaultAdd: DEFAULT_ADD_PREFS,
  experience: DEFAULT_EXPERIENCE,
  hydrated: false,

  hydrateFromServer: async () => {
    const next = await loadPrefsFromServer()
    set({
      defaultAdd: next.defaultAdd,
      experience: next.experience,
      hydrated: true,
    })
  },

  hydrate: () => undefined,

  setDefaultAdd: (patch) => {
    set((state) => ({ defaultAdd: { ...state.defaultAdd, ...patch } }))
    sync(get)
  },

  setExperience: (patch) => {
    set((state) => ({ experience: { ...state.experience, ...patch } }))
    sync(get)
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
    applyPreferencesImport(raw, set, get)
  },
}))
