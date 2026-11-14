export type ServiceType =
  | 'sonarr'
  | 'radarr'
  | 'lidarr'
  | 'sabnzbd'
  | 'qbittorrent'
  | 'seerr'
  | 'prowlarr'
  | 'tautulli'
  | 'transmission'
  | 'nzbget'
  | 'deluge'

export type ConnectionMode = 'direct' | 'proxy'

export interface ServiceConfig {
  id: string
  type: ServiceType
  name: string
  baseUrl: string
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
