import type { ServiceType } from '@/types/config'

export const SERVICE_ACCENT: Record<string, string> = {
  sonarr: '#38BDF8',
  radarr: '#F59E0B',
  lidarr: '#10B981',
  prowlarr: '#A855F7',
  qbittorrent: '#60A5FA',
  sabnzbd: '#FBBF24',
  seerr: '#818CF8',
}

export function serviceAccent(type: ServiceType | string): string {
  return SERVICE_ACCENT[type] ?? '#A1A1AA'
}

export function withAlpha(hex: string, alphaHex: string): string {
  if (!hex.startsWith('#') || (hex.length !== 7 && hex.length !== 4)) return hex
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex
  return `${full}${alphaHex}`
}
