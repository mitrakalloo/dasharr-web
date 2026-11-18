export type UrlMode = 'auto' | 'local' | 'remote'

export function effectiveServiceUrl(input: {
  baseUrl: string
  localUrl?: string | null
  remoteUrl?: string | null
  urlMode?: string | null
}): string {
  const mode = (input.urlMode ?? 'auto') as UrlMode
  if (mode === 'local') {
    return (input.localUrl || input.baseUrl).replace(/\/+$/, '')
  }
  if (mode === 'remote') {
    return (input.remoteUrl || input.baseUrl).replace(/\/+$/, '')
  }
  const pick = input.remoteUrl || input.localUrl || input.baseUrl
  return pick.replace(/\/+$/, '')
}

/** Only allow relative API paths — never absolute URLs from the client. */
export function assertSafeServicePath(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error('Path must start with /')
  }
  if (path.startsWith('//') || path.includes('://') || path.includes('\\')) {
    throw new Error('Absolute or opaque paths are not allowed')
  }
  return path
}
