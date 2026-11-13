import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { isBiometricUnlockEnabled } from '@/lib/vault/webauthn'
import { useConfigStore } from '@/stores/configStore'

export function UnlockScreen() {
  const unlock = useConfigStore((state) => state.unlock)
  const unlockWithBiometric = useConfigStore((state) => state.unlockWithBiometric)
  const [passphrase, setPassphrase] = useState('')
  const [busy, setBusy] = useState(false)
  const [bioEnabled, setBioEnabled] = useState(false)

  useEffect(() => {
    setBioEnabled(isBiometricUnlockEnabled())
  }, [])

  async function unlockBio() {
    setBusy(true)
    try {
      await unlockWithBiometric()
      toast.success('Vault unlocked')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Biometric unlock failed'
      if (!/cancel/i.test(message)) toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!bioEnabled) return
    void unlockBio()
    // Auto-prompt once when biometric unlock is enabled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bioEnabled])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await unlock(passphrase)
      toast.success('Vault unlocked')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not unlock')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050507] px-4 text-[var(--color-foreground)]">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Unlock Dasharr</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {bioEnabled
              ? 'Use your passkey (Face ID / fingerprint), or enter your passphrase.'
              : 'Enter your local vault passphrase. Keys stay encrypted in this browser.'}
          </p>
        </div>

        {bioEnabled ? (
          <Button
            type="button"
            className="w-full"
            disabled={busy}
            onClick={() => void unlockBio()}
          >
            {busy ? 'Waiting…' : 'Unlock with passkey'}
          </Button>
        ) : null}

        <Input
          label="Passphrase"
          type="password"
          autoComplete="current-password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          autoFocus={!bioEnabled}
        />
        <Button type="submit" className="w-full" variant={bioEnabled ? 'secondary' : 'primary'} disabled={busy || !passphrase}>
          {busy ? 'Unlocking…' : 'Unlock with passphrase'}
        </Button>
      </form>
    </div>
  )
}
