import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import {
  canUsePasskeyVaultUnlock,
  clearPasskeyUnlockUnsupported,
  isBiometricUnlockEnabled,
  isPasskeyUnlockMarkedUnsupported,
} from '@/lib/vault/webauthn'
import { useConfigStore } from '@/stores/configStore'

function isChromeOnMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /Mac/.test(navigator.platform) &&
    /Chrome\//.test(navigator.userAgent) &&
    !/Edg\//.test(navigator.userAgent)
  )
}

export function BiometricUnlockControls() {
  const enableBiometricUnlock = useConfigStore((state) => state.enableBiometricUnlock)
  const disableBiometricUnlock = useConfigStore((state) => state.disableBiometricUnlock)
  const [supported, setSupported] = useState(false)
  const [reason, setReason] = useState<string | undefined>()
  const [enabled, setEnabled] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const chromeMac = isChromeOnMac()

  useEffect(() => {
    void canUsePasskeyVaultUnlock().then((result) => {
      setSupported(result.ok)
      setReason(result.reason)
    })
    setEnabled(isBiometricUnlockEnabled())
    setBlocked(isPasskeyUnlockMarkedUnsupported())
  }, [])

  async function handleEnable() {
    setBusy(true)
    try {
      clearPasskeyUnlockUnsupported()
      await enableBiometricUnlock()
      setEnabled(true)
      setBlocked(false)
      toast.success('Passkey unlock enabled')
    } catch (error) {
      setBlocked(isPasskeyUnlockMarkedUnsupported())
      toast.error(error instanceof Error ? error.message : 'Could not enable passkey unlock')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
      <p className="text-sm font-medium">Passkey unlock</p>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Optional. Your passphrase is the reliable unlock method.
      </p>

      <ol className="list-decimal space-y-1 pl-4 text-xs text-[var(--color-muted-foreground)]">
        <li>
          If you use <span className="text-[var(--color-foreground)]">Bitwarden</span> (or another passkey
          extension), turn off its passkey provider for this try — it often blocks vault PRF
        </li>
        {chromeMac ? (
          <>
            <li>
              In Chrome, open{' '}
              <span className="text-[var(--color-foreground)]">chrome://password-manager/settings</span> and
              enable saving passkeys
            </li>
            <li>
              Save to <span className="text-[var(--color-foreground)]">iCloud</span> or{' '}
              <span className="text-[var(--color-foreground)]">Google Password Manager</span> — not Chrome
              profile
            </li>
          </>
        ) : null}
        <li>Or use Safari with iCloud Keychain instead</li>
      </ol>

      {!supported && !enabled ? (
        <p className="text-xs text-amber-300">{reason ?? 'Passkey vault unlock isn’t available here.'}</p>
      ) : null}

      {blocked && !enabled ? (
        <p className="text-xs text-amber-300">
          Last attempt used a passkey without PRF. Fix the Chrome save location above, then try again — or stick
          with passphrase.
        </p>
      ) : null}

      {enabled ? (
        <Button
          variant="secondary"
          className="w-full"
          disabled={busy}
          onClick={() => {
            disableBiometricUnlock()
            setEnabled(false)
            toast.message('Passkey unlock disabled')
          }}
        >
          Disable passkey unlock
        </Button>
      ) : (
        <Button className="w-full" disabled={busy || !supported} onClick={() => void handleEnable()}>
          {busy ? 'Follow the device prompt…' : blocked ? 'Try passkey unlock again' : 'Enable passkey unlock'}
        </Button>
      )}
    </div>
  )
}
