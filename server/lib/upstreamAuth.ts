import type { ServiceSecrets } from './secrets'

export function upstreamAuthHeaders(
  type: string,
  secrets: ServiceSecrets,
  username?: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {}
  if (
    type === 'qbittorrent' ||
    type === 'transmission' ||
    type === 'nzbget' ||
    type === 'deluge'
  ) {
    return headers
  }
  if (!secrets.apiKey) return headers
  if (type === 'sabnzbd' || type === 'tautulli') {
    return headers
  }
  if (type === 'bazarr') {
    headers['X-API-KEY'] = secrets.apiKey
  } else if (type === 'unraid') {
    // Unraid GraphQL expects x-api-key. Bearer falls through to cookie/CSRF auth.
    headers['x-api-key'] = secrets.apiKey
  } else {
    headers['X-Api-Key'] = secrets.apiKey
  }
  void username
  return headers
}

export function withQueryApiKey(
  type: string,
  url: URL,
  secrets: ServiceSecrets,
): void {
  if ((type === 'sabnzbd' || type === 'tautulli') && secrets.apiKey) {
    url.searchParams.set('apikey', secrets.apiKey)
  }
}
