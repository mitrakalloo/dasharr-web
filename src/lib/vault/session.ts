/** In-memory passphrase for re-saving the vault. Cleared on lock. Never persisted. */
let sessionPassphrase: string | null = null

export function setSessionPassphrase(value: string | null): void {
  sessionPassphrase = value
}

export function getSessionPassphrase(): string | null {
  return sessionPassphrase
}
