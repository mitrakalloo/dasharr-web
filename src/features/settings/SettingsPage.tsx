import { toast } from 'sonner'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { ConnectionSettings } from '@/features/settings/ConnectionSettings'
import { ExperiencePrefsCard } from '@/features/settings/ExperiencePrefsCard'
import { LayoutTransferCard } from '@/features/settings/LayoutTransferCard'
import { ServiceForm } from '@/features/settings/ServiceForm'
import { ServiceImportCard } from '@/features/settings/ServiceImportCard'
import { ServiceList } from '@/features/settings/ServiceList'
import { VaultSettingsCard } from '@/features/vault/VaultSettingsCard'
import { useConfigStore } from '@/stores/configStore'
import type { AppConfig } from '@/types/config'

export function SettingsPage() {
  const hasVault = useConfigStore((s) => s.hasVault)
  const exportConfig = useConfigStore((s) => s.exportConfig)
  const importConfig = useConfigStore((s) => s.importConfig)
  const resetConfig = useConfigStore((s) => s.resetConfig)

  function handleExport() {
    if (!hasVault) {
      toast.error('Create a vault first')
      return
    }
    const blob = new Blob([JSON.stringify(exportConfig(), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dasharr-config.json'
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Exported (plaintext file — store it safely)')
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppConfig
        importConfig(parsed)
        toast.success('Config imported')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Invalid config file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div>
      <SubpageHeader
        title="Settings"
        subtitle="Encrypted locally in this browser — no account"
        backTo="/more"
      />

      <section className="space-y-6 px-4 pb-10 pt-4">
        <VaultSettingsCard />
        <ExperiencePrefsCard />
        <LayoutTransferCard />
        {hasVault ? (
          <>
            <ConnectionSettings />
            <ServiceImportCard />
            <ServiceForm />
          </>
        ) : null}

        {hasVault ? (
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Configured services</h2>
            <ServiceList />
          </section>
        ) : null}

        <section className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <Button variant="secondary" onClick={handleExport}>
            Export JSON
          </Button>
          <label className="inline-flex min-h-[var(--tap)] cursor-pointer items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-4 text-sm font-semibold">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <Button
            variant="danger"
            onClick={() => {
              resetConfig()
              toast.message('Vault and local config cleared')
            }}
          >
            Reset
          </Button>
        </section>
      </section>
    </div>
  )
}
