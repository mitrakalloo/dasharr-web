import { apiJson } from '@/lib/api/server'
import {
  DEFAULT_ADD_PREFS,
  DEFAULT_EXPERIENCE,
  type DefaultAddPrefs,
  type ExperiencePrefs,
} from '@/lib/prefs/prefs.types'
import { createDebouncedPut } from '@/lib/sync/debouncedPut'

const LOCAL_KEY = 'dasharr.preferences.v1'
const putter = createDebouncedPut(450)

export type PrefsPayload = {
  version: 1
  defaultAdd: DefaultAddPrefs
  experience: ExperiencePrefs
}

export function readLocalPrefs(): PrefsPayload | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PrefsPayload>
    return {
      version: 1,
      defaultAdd: { ...DEFAULT_ADD_PREFS, ...parsed.defaultAdd },
      experience: { ...DEFAULT_EXPERIENCE, ...parsed.experience },
    }
  } catch {
    return null
  }
}

export function clearLocalPrefs() {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // ignore
  }
}

export function schedulePrefsPut(payload: PrefsPayload) {
  putter.schedule(async () => {
    await apiJson('/api/state/prefs', {
      method: 'PUT',
      body: JSON.stringify({ prefs: payload }),
    })
  })
}

export async function flushPrefsPut() {
  await putter.flush()
}

export async function loadPrefsFromServer(): Promise<PrefsPayload> {
  const remote = await apiJson<{ prefs: PrefsPayload | null }>('/api/state/prefs')
  if (remote.prefs) {
    clearLocalPrefs()
    return {
      version: 1,
      defaultAdd: { ...DEFAULT_ADD_PREFS, ...remote.prefs.defaultAdd },
      experience: { ...DEFAULT_EXPERIENCE, ...remote.prefs.experience },
    }
  }

  const local = readLocalPrefs()
  const next: PrefsPayload = local ?? {
    version: 1,
    defaultAdd: DEFAULT_ADD_PREFS,
    experience: DEFAULT_EXPERIENCE,
  }
  await apiJson('/api/state/prefs', {
    method: 'PUT',
    body: JSON.stringify({ prefs: next }),
  })
  clearLocalPrefs()
  return next
}
