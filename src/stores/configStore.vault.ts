import { decryptJson } from '@/lib/vault/crypto'
import { getSessionPassphrase, setSessionPassphrase } from '@/lib/vault/session'
import { readVaultBlob } from '@/lib/vault/storage'
import {
  clearBiometricRecord,
  enrollBiometricUnlock,
  isBiometricUnlockEnabled,
  unlockPassphraseWithBiometric,
} from '@/lib/vault/webauthn'
import { bootVaultState, saveVault, wipeVaultStorage } from '@/stores/configVault'
import { DEFAULT_CONFIG, type AppConfig, type AppSettings, type ServiceConfig } from '@/types/config'

type SetState = (
  partial:
    | Partial<VaultAwareState>
    | ((state: VaultAwareState) => Partial<VaultAwareState>),
) => void

type GetState = () => VaultAwareState & {
  persistVault: () => Promise<void>
}

export interface VaultAwareState {
  settings: AppSettings
  services: ServiceConfig[]
  hydrated: boolean
  vaultPhase: ReturnType<typeof bootVaultState>['vaultPhase']
  hasVault: boolean
  vaultLocked: boolean
}

export function createVaultActions(set: SetState, get: GetState) {
  return {
    bootstrap: () => set({ ...bootVaultState(), hydrated: true }),

    unlock: async (passphrase: string) => {
      const vault = readVaultBlob()
      if (!vault) throw new Error('No vault found')
      const config = await decryptJson<AppConfig>(passphrase, vault)
      setSessionPassphrase(passphrase)
      set({
        settings: { ...DEFAULT_CONFIG.settings, ...config.settings },
        services: config.services ?? [],
        vaultPhase: 'ready',
        hasVault: true,
        vaultLocked: false,
        hydrated: true,
      })
    },

    setupVault: async (passphrase: string) => {
      if (passphrase.trim().length < 8) throw new Error('Use at least 8 characters')
      const { settings, services } = get()
      await saveVault(passphrase, settings, services)
      setSessionPassphrase(passphrase)
      set({ vaultPhase: 'ready', hasVault: true, vaultLocked: false, hydrated: true })
    },

    changePassphrase: async (current: string, next: string) => {
      if (next.trim().length < 8) throw new Error('Use at least 8 characters')
      const vault = readVaultBlob()
      if (!vault) throw new Error('No vault found')
      await decryptJson<AppConfig>(current, vault)
      const { settings, services } = get()
      const hadBio = isBiometricUnlockEnabled()
      await saveVault(next, settings, services)
      setSessionPassphrase(next)
      if (hadBio) {
        clearBiometricRecord()
        await enrollBiometricUnlock(next)
      }
    },

    unlockWithBiometric: async () => {
      const passphrase = await unlockPassphraseWithBiometric()
      const vault = readVaultBlob()
      if (!vault) throw new Error('No vault found')
      const config = await decryptJson<AppConfig>(passphrase, vault)
      setSessionPassphrase(passphrase)
      set({
        settings: { ...DEFAULT_CONFIG.settings, ...config.settings },
        services: config.services ?? [],
        vaultPhase: 'ready',
        hasVault: true,
        vaultLocked: false,
        hydrated: true,
      })
    },

    enableBiometricUnlock: async () => {
      const passphrase = getSessionPassphrase()
      if (!passphrase) throw new Error('Unlock the vault first')
      await enrollBiometricUnlock(passphrase)
    },

    disableBiometricUnlock: () => {
      clearBiometricRecord()
    },

    lock: () => {
      setSessionPassphrase(null)
      if (!readVaultBlob()) {
        set({
          settings: DEFAULT_CONFIG.settings,
          services: [],
          vaultPhase: 'ready',
          hasVault: false,
          vaultLocked: false,
        })
        return
      }
      set({
        settings: DEFAULT_CONFIG.settings,
        services: [],
        vaultPhase: 'locked',
        hasVault: true,
        vaultLocked: true,
      })
    },

    persistVault: async () => {
      const passphrase = getSessionPassphrase()
      if (!passphrase || !get().hasVault) return
      const { settings, services } = get()
      await saveVault(passphrase, settings, services)
    },

    resetConfig: () => {
      wipeVaultStorage()
      set({
        settings: DEFAULT_CONFIG.settings,
        services: [],
        vaultPhase: 'ready',
        hasVault: false,
        vaultLocked: false,
      })
    },
  }
}
