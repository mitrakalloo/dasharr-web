import type { VaultBlobV1 } from '@/lib/vault/crypto'
import type { AppConfig } from '@/types/config'

export const VAULT_STORAGE_KEY = 'dasharr-vault'
export const LEGACY_STORAGE_KEY = 'dasharr-config'

export function readVaultBlob(): VaultBlobV1 | null {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VaultBlobV1
    if (parsed?.version !== 1 || !parsed.salt || !parsed.iv || !parsed.ciphertext) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writeVaultBlob(blob: VaultBlobV1): void {
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(blob))
}

export function clearVaultBlob(): void {
  localStorage.removeItem(VAULT_STORAGE_KEY)
}

/** Zustand persist used to write `{ state: { settings, services }, version }`. */
export function readLegacyPlainConfig(): AppConfig | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      state?: { settings?: AppConfig['settings']; services?: AppConfig['services'] }
      settings?: AppConfig['settings']
      services?: AppConfig['services']
    }
    const settings = parsed.state?.settings ?? parsed.settings
    const services = parsed.state?.services ?? parsed.services
    if (!settings || !services) return null
    return { version: 1, settings, services }
  } catch {
    return null
  }
}

export function clearLegacyPlainConfig(): void {
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}
