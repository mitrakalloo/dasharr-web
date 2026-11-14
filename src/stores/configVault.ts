import { encryptJson } from '@/lib/vault/crypto'
import { setSessionPassphrase } from '@/lib/vault/session'
import {
  clearLegacyPlainConfig,
  clearVaultBlob,
  readLegacyPlainConfig,
  readVaultBlob,
  writeVaultBlob,
} from '@/lib/vault/storage'
import { clearBiometricRecord } from '@/lib/vault/webauthn'
import { DEFAULT_CONFIG, type AppConfig, type AppSettings, type ServiceConfig } from '@/types/config'

export type VaultPhase = 'booting' | 'locked' | 'setup' | 'ready'

export async function saveVault(
  passphrase: string,
  settings: AppSettings,
  services: ServiceConfig[],
) {
  const blob = await encryptJson(passphrase, {
    version: 1 as const,
    settings,
    services,
  } satisfies AppConfig)
  writeVaultBlob(blob)
  clearLegacyPlainConfig()
}

export function bootVaultState(): {
  settings: AppSettings
  services: ServiceConfig[]
  vaultPhase: VaultPhase
  hasVault: boolean
  vaultLocked: boolean
} {
  const vault = readVaultBlob()
  const legacy = readLegacyPlainConfig()

  if (vault) {
    return {
      settings: DEFAULT_CONFIG.settings,
      services: [],
      vaultPhase: 'locked',
      hasVault: true,
      vaultLocked: true,
    }
  }

  if (legacy) {
    return {
      settings: { ...DEFAULT_CONFIG.settings, ...legacy.settings },
      services: legacy.services ?? [],
      vaultPhase: 'setup',
      hasVault: false,
      vaultLocked: false,
    }
  }

  return {
    settings: DEFAULT_CONFIG.settings,
    services: [],
    vaultPhase: 'ready',
    hasVault: false,
    vaultLocked: false,
  }
}

export function wipeVaultStorage() {
  setSessionPassphrase(null)
  clearVaultBlob()
  clearLegacyPlainConfig()
  clearBiometricRecord()
}
