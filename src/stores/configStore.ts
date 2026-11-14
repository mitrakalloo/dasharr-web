import { create } from 'zustand'

import { createVaultActions } from '@/stores/configStore.vault'
import {
  DEFAULT_CONFIG,
  type AppConfig,
  type AppSettings,
  type ServiceConfig,
  type ServiceType,
} from '@/types/config'

interface ConfigState {
  settings: AppSettings
  services: ServiceConfig[]
  hydrated: boolean
  vaultPhase: 'booting' | 'locked' | 'setup' | 'ready'
  hasVault: boolean
  vaultLocked: boolean
  bootstrap: () => Promise<void>
  unlock: (passphrase: string) => Promise<void>
  unlockWithBiometric: () => Promise<void>
  setupVault: (passphrase: string) => Promise<void>
  changePassphrase: (current: string, next: string) => Promise<void>
  enableBiometricUnlock: () => Promise<void>
  disableBiometricUnlock: () => void
  lock: () => void
  persistVault: () => Promise<void>
  updateSettings: (patch: Partial<AppSettings>) => void
  addService: (input: Omit<ServiceConfig, 'id'>) => ServiceConfig
  updateService: (id: string, patch: Partial<ServiceConfig>) => void
  removeService: (id: string) => void
  getServicesByType: (type: ServiceType) => ServiceConfig[]
  exportConfig: () => AppConfig
  importConfig: (config: AppConfig) => void
  resetConfig: () => void
}

function createId(): string {
  return crypto.randomUUID()
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  settings: DEFAULT_CONFIG.settings,
  services: DEFAULT_CONFIG.services,
  hydrated: false,
  vaultPhase: 'booting',
  hasVault: false,
  vaultLocked: false,
  ...createVaultActions(set, get),

  updateSettings: (patch) => {
    set((state) => ({ settings: { ...state.settings, ...patch } }))
    void get().persistVault()
  },

  addService: (input) => {
    if (!get().hasVault) throw new Error('Create a vault passphrase before saving services')
    const service: ServiceConfig = { ...input, id: createId() }
    set((state) => ({ services: [...state.services, service] }))
    void get().persistVault()
    return service
  },

  updateService: (id, patch) => {
    set((state) => ({
      services: state.services.map((service) =>
        service.id === id ? { ...service, ...patch } : service,
      ),
    }))
    void get().persistVault()
  },

  removeService: (id) => {
    set((state) => ({
      services: state.services.filter((service) => service.id !== id),
    }))
    void get().persistVault()
  },

  getServicesByType: (type) =>
    get().services.filter((service) => service.type === type && service.enabled),

  exportConfig: () => ({
    version: 1,
    settings: get().settings,
    services: get().services,
  }),

  importConfig: (config) => {
    if (config.version !== 1) throw new Error('Unsupported config version')
    if (!get().hasVault) throw new Error('Create a vault passphrase before importing')
    set({
      settings: { ...DEFAULT_CONFIG.settings, ...config.settings },
      services: config.services ?? [],
    })
    void get().persistVault()
  },
}))
