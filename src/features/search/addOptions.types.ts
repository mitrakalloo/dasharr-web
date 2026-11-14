export interface NamedOption {
  id: number | string
  name: string
  path?: string
}

export interface AddOptions {
  qualityProfileId: number
  rootFolderPath: string
  monitored: boolean
  searchNow: boolean
  serverId?: number
  is4k?: boolean
  seasons?: number[]
}

export interface AddOptionsBundle {
  mode: 'add' | 'request'
  qualityProfiles: NamedOption[]
  rootFolders: NamedOption[]
  servers?: NamedOption[]
  defaultServerId?: number
}
