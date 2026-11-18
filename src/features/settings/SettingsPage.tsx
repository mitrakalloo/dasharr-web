import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { AccountCard } from '@/features/settings/AccountCard'
import { AuditCard } from '@/features/settings/AuditCard'
import { ExperiencePrefsCard } from '@/features/settings/ExperiencePrefsCard'
import { InvitesCard } from '@/features/settings/InvitesCard'
import { LayoutTransferCard } from '@/features/settings/LayoutTransferCard'
import { ServiceForm } from '@/features/settings/ServiceForm'
import { ServiceImportCard } from '@/features/settings/ServiceImportCard'
import { ServiceList } from '@/features/settings/ServiceList'
import { useConfigStore } from '@/stores/configStore'

export function SettingsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const exportConfig = useConfigStore((s) => s.exportConfig)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (params.get('focus') === 'services') {
      document.getElementById('settings-services')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [params])

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
        subtitle="Connect stack · secrets stay on the server"
        onBack={() => navigate(-1)}
      />

      <section className="space-y-6 px-4 pb-10 pt-4">
        <div id="settings-services" className="space-y-4">
          <ServiceForm />
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Configured services</h2>
            <ServiceList />
          </section>
          <ServiceImportCard />
        </div>

        <ExperiencePrefsCard />

        <Button variant="secondary" onClick={() => setShowAdvanced((value) => !value)}>
          {showAdvanced ? 'Hide household admin' : 'Household admin'}
        </Button>

        {showAdvanced ? (
          <>
            <AccountCard />
            <InvitesCard />
            <AuditCard />
            <LayoutTransferCard />
            <section className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <Button variant="secondary" onClick={handleExport}>
                Export service metadata
              </Button>
            </section>
          </>
        ) : null}
      </section>
    </div>
  )
}
