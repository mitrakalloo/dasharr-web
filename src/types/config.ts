export type ServiceType =
  | 'sonarr'
  | 'radarr'
  | 'lidarr'
  | 'readarr'
  | 'whisparr'
  | 'sabnzbd'
  | 'qbittorrent'
  | 'seerr'
  | 'prowlarr'
  | 'tautulli'
  | 'transmission'
  | 'nzbget'
  | 'deluge'
  | 'bazarr'
  | 'unraid'

export type ConnectionMode = 'direct' | 'proxy'
export type ServiceUrlMode = 'auto' | 'local' | 'remote'

export interface ServiceConfig {
  id: string
  type: ServiceType
  name: string
  baseUrl: string
  /** Optional LAN URL when remote differs from local. */
  localUrl?: string
  /** Optional WAN / tunnel URL. */
  remoteUrl?: string
  urlMode?: ServiceUrlMode
  apiKey: string
  username?: string
  password?: string
  enabled: boolean
}

export interface AppSettings {
  connectionMode: ConnectionMode
  proxyUrl: string
  proxySecret: string
}

export interface AppConfig {
  version: 1
  settings: AppSettings
  services: ServiceConfig[]
}

export const SERVICE_META: Record<
  ServiceType,
  { label: string; defaultPort: number; needsApiKey: boolean; needsBasicAuth: boolean }
> = {
  sonarr: { label: 'Sonarr', defaultPort: 8989, needsApiKey: true, needsBasicAuth: false },
  radarr: { label: 'Radarr', defaultPort: 7878, needsApiKey: true, needsBasicAuth: false },
  lidarr: { label: 'Lidarr', defaultPort: 8686, needsApiKey: true, needsBasicAuth: false },
  readarr: { label: 'Readarr', defaultPort: 8787, needsApiKey: true, needsBasicAuth: false },
  whisparr: { label: 'Whisparr', defaultPort: 6969, needsApiKey: true, needsBasicAuth: false },
  sabnzbd: { label: 'SABnzbd', defaultPort: 8080, needsApiKey: true, needsBasicAuth: false },
  qbittorrent: {
    label: 'qBittorrent',
    defaultPort: 8080,
    needsApiKey: false,
    needsBasicAuth: true,
  },
  seerr: { label: 'Seerr', defaultPort: 5055, needsApiKey: true, needsBasicAuth: false },
  prowlarr: { label: 'Prowlarr', defaultPort: 9696, needsApiKey: true, needsBasicAuth: false },
  tautulli: { label: 'Tautulli', defaultPort: 8181, needsApiKey: true, needsBasicAuth: false },
  transmission: {
    label: 'Transmission',
    defaultPort: 9091,
    needsApiKey: false,
    needsBasicAuth: true,
  },
  nzbget: { label: 'NZBGet', defaultPort: 6789, needsApiKey: false, needsBasicAuth: true },
  deluge: { label: 'Deluge', defaultPort: 8112, needsApiKey: true, needsBasicAuth: false },
  bazarr: { label: 'Bazarr', defaultPort: 6767, needsApiKey: true, needsBasicAuth: false },
  unraid: { label: 'Unraid', defaultPort: 80, needsApiKey: true, needsBasicAuth: false },
}

export const DEFAULT_SETTINGS: AppSettings = {
  connectionMode: 'proxy',
  proxyUrl: '/api/proxy',
  proxySecret: '',
}

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  services: [],
}

/** Resolve which URL to call for a service (local / remote / base). */
export function effectiveServiceUrl(service: ServiceConfig): string {
  const mode = service.urlMode ?? 'auto'
  if (mode === 'local') {
    return (service.localUrl || service.baseUrl).replace(/\/+$/, '')
  }
  if (mode === 'remote') {
    return (service.remoteUrl || service.baseUrl).replace(/\/+$/, '')
  }
  // auto: prefer remote when set (companion often reaches via tunnel), else local, else base
  const pick = service.remoteUrl || service.localUrl || service.baseUrl
  return pick.replace(/\/+$/, '')
}
