import type { ServiceType } from '@/types/config'

/** Matches dasharr/theme/colors.ts darkServiceKindColor */
export const SERVICE_ACCENT: Record<string, string> = {
  sonarr: '#38BDF8',
  radarr: '#F59E0B',
  lidarr: '#A78BFA',
  prowlarr: '#94A3B8',
  qbittorrent: '#60A5FA',
  sabnzbd: '#FBBF24',
  seerr: '#3B82F6',
  tautulli: '#2DD4BF',
  transmission: '#D35400',
  nzbget: '#34D399',
  deluge: '#4B7BEC',
  readarr: '#E879F9',
  whisparr: '#FB7185',
  bazarr: '#38BDF8',
  unraid: '#F97316',
}

export function serviceAccent(type: ServiceType | string): string {
  return SERVICE_ACCENT[type] ?? '#A8B4C6'
}

export function withAlpha(hex: string, alphaHex: string): string {
  if (!hex.startsWith('#') || (hex.length !== 7 && hex.length !== 4)) return hex
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex
  return `${full}${alphaHex}`
}
