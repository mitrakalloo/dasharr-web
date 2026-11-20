import { useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { usePrefsStore } from '@/stores/prefsStore'

export function LayoutTransferCard() {
  const fileRef = useRef<HTMLInputElement>(null)
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
    <section className="panel space-y-3.5 rounded-[var(--radius-2xl)] p-5">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
          Layout backup
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Export or restore your dashboard layout JSON. Live edits already sync via your account.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <Download className="size-3.5" />
          Export layout
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Import layout
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </section>
  )
}
