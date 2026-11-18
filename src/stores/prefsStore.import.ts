import {
  DEFAULT_ADD_PREFS,
  DEFAULT_EXPERIENCE,
  type DefaultAddPrefs,
  type ExperiencePrefs,
} from '@/lib/prefs/prefs.types'
import { useDashboardStore } from '@/stores/dashboardStore'
import {
  scheduleDashboardPut,
  toDashboardPayload,
} from '@/stores/dashboardStore.sync'
import { schedulePrefsPut } from '@/stores/prefsStore.sync'

const PREFERENCES_EXPORT_KIND = 'dasharr.preferences'

export function applyPreferencesImport(
  raw: string,
  set: (
    partial:
      | Partial<{ defaultAdd: DefaultAddPrefs; experience: ExperiencePrefs }>
      | ((
          state: { defaultAdd: DefaultAddPrefs; experience: ExperiencePrefs },
        ) => Partial<{ defaultAdd: DefaultAddPrefs; experience: ExperiencePrefs }>),
  ) => void,
  get: () => { defaultAdd: DefaultAddPrefs; experience: ExperiencePrefs },
) {
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
          ...DEFAULT_ADD_PREFS,
          ...state.defaultAdd,
          ...(prefs as Partial<DefaultAddPrefs>),
        },
      }))
    }
  }

  if (Array.isArray(prefs.dashboards)) {
    const list = prefs.dashboards as ReturnType<typeof useDashboardStore.getState>['dashboards']
    const active =
      typeof prefs.activeDashboardId === 'string' ? prefs.activeDashboardId : list[0]?.id
    const layoutVersion =
      typeof prefs.dashboardLayoutVersion === 'number'
        ? prefs.dashboardLayoutVersion
        : useDashboardStore.getState().layoutVersion
    useDashboardStore.setState({
      dashboards: list,
      activeDashboardId: active ?? useDashboardStore.getState().activeDashboardId,
      layoutVersion,
      hydrated: true,
    })
    scheduleDashboardPut(
      toDashboardPayload({
        dashboards: list,
        activeDashboardId: active ?? list[0].id,
        layoutVersion,
      }),
    )
  }

  schedulePrefsPut({
    version: 1,
    defaultAdd: get().defaultAdd,
    experience: get().experience,
  })
}
