export type LiveTitleService = 'sonarr' | 'radarr' | 'lidarr'

export function liveTitleId(service: LiveTitleService, id: number): string {
  return `${service}-${id}`
}

export function parseLiveTitleId(
  id: string,
): { service: LiveTitleService; numericId: number } | null {
  const match = /^(sonarr|radarr|lidarr)-(\d+)$/.exec(id)
  if (!match) return null
  return { service: match[1] as LiveTitleService, numericId: Number(match[2]) }
}
