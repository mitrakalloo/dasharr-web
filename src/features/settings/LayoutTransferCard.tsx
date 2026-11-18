import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { usePrefsStore } from '@/stores/prefsStore'

export function LayoutTransferCard() {
  const exportPreferences = usePrefsStore((state) => state.exportPreferences)
  const importPreferences = usePrefsStore((state) => state.importPreferences)

  function handleExport() {
    const blob = new Blob([exportPreferences()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dasharr-layout.json'
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Layout exported (no credentials)')
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importPreferences(String(reader.result))
        toast.success('Layout imported')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Invalid layout file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <h2 className="text-base font-semibold">Layout transfer</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Backup or restore layout. Live edits already sync via your account.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleExport}>
          Export layout
        </Button>
        <label className="inline-flex min-h-[var(--tap)] cursor-pointer items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-4 text-sm font-semibold">
          Import layout
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>
    </section>
  )
}
