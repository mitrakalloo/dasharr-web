import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfigStore } from '@/stores/configStore'

interface SetupVaultScreenProps {
  title?: string
  description?: string
  onDone?: () => void
  compact?: boolean
}

export function SetupVaultScreen({
  title = 'Protect your config',
  description = 'Set a local passphrase to encrypt API keys in this browser. No account — it never leaves your device.',
  onDone,
  compact = false,
}: SetupVaultScreenProps) {
  const setupVault = useConfigStore((state) => state.setupVault)
  const serviceCount = useConfigStore((state) => state.services.length)
  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (passphrase !== confirm) {
      toast.error('Passphrases do not match')
      return
    }
    setBusy(true)
    try {
      await setupVault(passphrase)
      toast.success('Vault created')
      onDone?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create vault')
    } finally {
      setBusy(false)
    }
  }

  const form = (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={
        compact
          ? 'space-y-3'
          : 'w-full max-w-sm space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5'
      }
    >
      <div>
        <h1 className={compact ? 'text-base font-semibold' : 'text-xl font-semibold tracking-tight'}>
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
        {serviceCount > 0 ? (
          <p className="mt-2 text-xs text-amber-300">
            {serviceCount} existing service{serviceCount === 1 ? '' : 's'} will be encrypted.
          </p>
        ) : null}
      </div>
      <Input
        label="Passphrase"
        type="password"
        autoComplete="new-password"
        value={passphrase}
        onChange={(event) => setPassphrase(event.target.value)}
        hint="At least 8 characters"
      />
      <Input
        label="Confirm"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={busy || passphrase.length < 8 || confirm.length < 8}
      >
        {busy ? 'Encrypting…' : 'Create vault'}
      </Button>
    </form>
  )

  if (compact) return form

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050507] px-4 text-[var(--color-foreground)]">
      {form}
    </div>
  )
}
