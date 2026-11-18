import { create } from 'zustand'

import { apiJson } from '@/lib/api/server'
import {
  DEFAULT_CONFIG,
  type AppConfig,
  type AppSettings,
  type ServiceConfig,
  type ServiceType,
} from '@/types/config'

type PublicServicePayload = {
  id: string
  type: ServiceType
  name: string
  baseUrl: string
  localUrl?: string
  remoteUrl?: string
  urlMode?: ServiceConfig['urlMode']
  enabled: boolean
  username?: string
  hasApiKey: boolean
  hasPassword: boolean
}

function toClientService(row: PublicServicePayload): ServiceConfig {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    baseUrl: row.baseUrl,
    localUrl: row.localUrl,
    remoteUrl: row.remoteUrl,
    urlMode: row.urlMode ?? 'auto',
    apiKey: '',
    username: row.username,
    password: undefined,
    enabled: row.enabled,
  }
}

interface ConfigState {
  settings: AppSettings
  services: ServiceConfig[]
  hydrated: boolean
  vaultPhase: 'booting' | 'locked' | 'setup' | 'ready'
  hasVault: boolean
  vaultLocked: boolean
  hydrateFromServer: () => Promise<void>
  /** @deprecated local vault path removed — no-op for compatibility */
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
  addService: (input: Omit<ServiceConfig, 'id'>) => Promise<ServiceConfig>
  updateService: (id: string, patch: Partial<ServiceConfig>) => Promise<void>
  removeService: (id: string) => Promise<void>
  getServicesByType: (type: ServiceType) => ServiceConfig[]
  exportConfig: () => AppConfig
  importConfig: (config: AppConfig) => void
  resetConfig: () => void
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  settings: { ...DEFAULT_CONFIG.settings, connectionMode: 'proxy' },
  services: [],
  hydrated: false,
  vaultPhase: 'booting',
  hasVault: false,
  vaultLocked: false,

  hydrateFromServer: async () => {
    const payload = await apiJson<{ services: PublicServicePayload[] }>('/api/services')
    set({
      services: payload.services.map(toClientService),
      hydrated: true,
      hasVault: true,
      vaultPhase: 'ready',
      vaultLocked: false,
      settings: { ...DEFAULT_CONFIG.settings, connectionMode: 'proxy' },
    })
  },

  bootstrap: async () => {
    // AccountGate owns bootstrap now
    set({ hydrated: true, vaultPhase: 'ready' })
  },
  unlock: async () => undefined,
  unlockWithBiometric: async () => undefined,
  setupVault: async () => undefined,
  changePassphrase: async () => undefined,
  enableBiometricUnlock: async () => undefined,
  disableBiometricUnlock: () => undefined,
  lock: () => undefined,
  persistVault: async () => undefined,

  updateSettings: (patch) => {
    set((state) => ({ settings: { ...state.settings, ...patch } }))
  },

  addService: async (input) => {
    const created = await apiJson<{ service: PublicServicePayload }>('/api/services', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    const service = toClientService(created.service)
    set((state) => ({ services: [...state.services, service] }))
    return service
  },

  updateService: async (id, patch) => {
    const updated = await apiJson<{ service: PublicServicePayload }>(`/api/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    const service = toClientService(updated.service)
    set((state) => ({
      services: state.services.map((entry) => (entry.id === id ? service : entry)),
    }))
  },

  removeService: async (id) => {
    await apiJson(`/api/services/${id}`, { method: 'DELETE' })
    set((state) => ({
      services: state.services.filter((service) => service.id !== id),
    }))
  },

  getServicesByType: (type) =>
    get().services.filter((service) => service.type === type && service.enabled),

  exportConfig: () => ({
    version: 1,
    settings: get().settings,
    // Secrets are never present client-side
    services: get().services,
  }),

  importConfig: () => {
    throw new Error('Use Settings → Import service for individual services (secrets via API)')
  },

  resetConfig: () => {
    set({
      settings: { ...DEFAULT_CONFIG.settings, connectionMode: 'proxy' },
      services: [],
    })
  },
}))
