/** Tab-lifetime unlock session. Survives refresh; cleared on Lock / tab close. */
const STORAGE_KEY = 'dasharr-vault-session-v1'

let sessionPassphrase: string | null = null

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStored(value: string | null): void {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, value)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private mode / blocked storage — memory-only for this load.
  }
}

export function setSessionPassphrase(value: string | null): void {
  sessionPassphrase = value
  writeStored(value)
}

export function getSessionPassphrase(): string | null {
  if (sessionPassphrase) return sessionPassphrase
  const stored = readStored()
  if (stored) sessionPassphrase = stored
  return sessionPassphrase
}
