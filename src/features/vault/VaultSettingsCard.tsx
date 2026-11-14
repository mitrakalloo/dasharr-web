import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BiometricUnlockControls } from '@/features/vault/BiometricUnlockControls'
import { SetupVaultScreen } from '@/features/vault/SetupVaultScreen'
import { useConfigStore } from '@/stores/configStore'

export function VaultSettingsCard() {
  const hasVault = useConfigStore((state) => state.hasVault)
  const lock = useConfigStore((state) => state.lock)
  const changePassphrase = useConfigStore((state) => state.changePassphrase)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleChange(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await changePassphrase(current, next)
      setCurrent('')
      setNext('')
      toast.success('Passphrase updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update passphrase')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <h2 className="text-base font-semibold">Local vault</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {hasVault
            ? 'API keys stay encrypted at rest. This tab stays unlocked across refresh until you Lock or close it.'
            : 'Create a passphrase before saving services. Nothing is uploaded.'}
        </p>
      </div>

      {!hasVault ? <SetupVaultScreen compact /> : null}

      {hasVault ? (
        <>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              lock()
              toast.message('Vault locked')
            }}
          >
            Lock now
          </Button>

          <BiometricUnlockControls />

          <form onSubmit={(event) => void handleChange(event)} className="space-y-3 border-t border-[var(--color-border)] pt-3">
            <p className="text-sm font-medium">Change passphrase</p>
            <Input
              label="Current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
            <Input
              label="New"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              hint="At least 8 characters"
            />
            <Button
              type="submit"
              variant="soft"
              className="w-full"
              disabled={busy || current.length === 0 || next.length < 8}
            >
              {busy ? 'Updating…' : 'Update passphrase'}
            </Button>
          </form>
        </>
      ) : null}
    </section>
  )
}
