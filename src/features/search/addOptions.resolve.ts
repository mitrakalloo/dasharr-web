import type { AddOptions, AddOptionsBundle, NamedOption } from '@/features/search/addOptions.types'
import type { DefaultAddPrefs } from '@/lib/prefs/prefs.types'

function pickProfile(profiles: NamedOption[], preferred?: number) {
  if (preferred != null) {
    const match = profiles.find((profile) => Number(profile.id) === preferred)
    if (match) return Number(match.id)
  }
  return profiles[0] ? Number(profiles[0].id) : 0
}

function pickFolder(folders: NamedOption[], preferred?: string) {
  if (preferred) {
    const match = folders.find((folder) => (folder.path ?? folder.name) === preferred)
    if (match) return match.path ?? match.name
  }
  return folders[0]?.path ?? folders[0]?.name ?? ''
}

export function resolveAddOptions(
  bundle: AddOptionsBundle,
  defaults: DefaultAddPrefs,
): AddOptions {
  return {
    qualityProfileId: pickProfile(bundle.qualityProfiles, defaults.qualityProfileId),
    rootFolderPath: pickFolder(bundle.rootFolders, defaults.rootFolderPath),
    monitored: defaults.monitored,
    searchNow: defaults.searchNow,
    serverId: defaults.serverId ?? bundle.defaultServerId,
    is4k: defaults.prefer4k,
  }
}
