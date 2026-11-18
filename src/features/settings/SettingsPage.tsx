import { toast } from 'sonner'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { AccountCard } from '@/features/settings/AccountCard'
import { ExperiencePrefsCard } from '@/features/settings/ExperiencePrefsCard'
import { InvitesCard } from '@/features/settings/InvitesCard'
import { LayoutTransferCard } from '@/features/settings/LayoutTransferCard'
import { ServiceForm } from '@/features/settings/ServiceForm'
import { ServiceImportCard } from '@/features/settings/ServiceImportCard'
import { ServiceList } from '@/features/settings/ServiceList'
import { useConfigStore } from '@/stores/configStore'

export function SettingsPage() {
  const exportConfig = useConfigStore((s) => s.exportConfig)

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportConfig(), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dasharr-services-metadata.json'
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Exported metadata only (no API keys)')
  }

  return (
    <div>
      <SubpageHeader
        title="Settings"
        subtitle="Account-backed · secrets encrypted on the server"
        backTo="/more"
      />

      <section className="space-y-6 px-4 pb-10 pt-4">
        <AccountCard />
        <InvitesCard />
        <ExperiencePrefsCard />
        <LayoutTransferCard />
        <ServiceImportCard />
        <ServiceForm />

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Configured services</h2>
          <ServiceList />
        </section>

        <section className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <Button variant="secondary" onClick={handleExport}>
            Export service metadata
          </Button>
        </section>
      </section>
    </div>
  )
}
