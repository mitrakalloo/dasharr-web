import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { AccountCard } from '@/features/settings/AccountCard'
import { AuditCard } from '@/features/settings/AuditCard'
import { ExperiencePrefsCard } from '@/features/settings/ExperiencePrefsCard'
import { InvitesCard } from '@/features/settings/InvitesCard'
import { LayoutTransferCard } from '@/features/settings/LayoutTransferCard'
import { ServiceForm } from '@/features/settings/ServiceForm'
import { ServiceImportCard } from '@/features/settings/ServiceImportCard'
import { ServiceList } from '@/features/settings/ServiceList'
import { useConfigStore } from '@/stores/configStore'

type SettingsTab = 'services' | 'experience' | 'account'

export function SettingsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const servicesCount = useConfigStore((s) => s.services.length)
  const exportConfig = useConfigStore((s) => s.exportConfig)

  const tabParam = params.get('tab')
  const tab: SettingsTab =
    params.get('focus') === 'services'
      ? 'services'
      : tabParam === 'experience' || tabParam === 'account'
        ? tabParam
        : 'services'

  function setTab(next: SettingsTab) {
    const nextParams = new URLSearchParams(params)
    nextParams.delete('focus')
    if (next === 'services') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  useEffect(() => {
    if (params.get('focus') === 'services') {
      requestAnimationFrame(() => {
        document.getElementById('settings-services')?.scrollIntoView({ behavior: 'smooth' })
      })
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
        subtitle="Services, preferences, and account security"
        onBack={() => navigate(-1)}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Settings' }]}
      />

      <div className="page-pad space-y-6">
        <SegmentedControl
          ariaLabel="Settings sections"
          variant="pills"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'services', label: 'Services', count: servicesCount },
            { value: 'experience', label: 'Experience' },
            { value: 'account', label: 'Account & Admin' },
          ]}
        />

        {tab === 'services' ? (
          <div id="settings-services" className="space-y-6">
            <section className="space-y-3">
              <SectionHeader title="Configured services" count={servicesCount} />
              <ServiceList />
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ServiceForm />
              </div>
              <div className="space-y-4 lg:col-span-5">
                <ServiceImportCard />
                <section className="panel space-y-3 rounded-[var(--radius-2xl)] p-4">
                  <div>
                    <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
                      Export service metadata
                    </h2>
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      Download your service list without API keys or passwords.
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={handleExport}>
                    <Download className="size-3.5" />
                    Export metadata JSON
                  </Button>
                </section>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'experience' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ExperiencePrefsCard />
            </div>
            <div className="lg:col-span-5">
              <LayoutTransferCard />
            </div>
          </div>
        ) : null}

        {tab === 'account' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <AccountCard />
            </div>
            <div className="space-y-6 lg:col-span-5">
              <InvitesCard />
              <AuditCard />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
