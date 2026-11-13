import { useEffect } from 'react'

import { SetupVaultScreen } from '@/features/vault/SetupVaultScreen'
import { UnlockScreen } from '@/features/vault/UnlockScreen'
import { useConfigStore } from '@/stores/configStore'

interface VaultGateProps {
  children: React.ReactNode
}

export function VaultGate({ children }: VaultGateProps) {
  const phase = useConfigStore((state) => state.vaultPhase)
  const bootstrap = useConfigStore((state) => state.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (phase === 'booting') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050507] text-sm text-[var(--color-muted-foreground)]">
        Loading vault…
      </div>
    )
  }

  if (phase === 'locked') return <UnlockScreen />

  if (phase === 'setup') {
    return (
      <SetupVaultScreen
        title="Encrypt existing config"
        description="Your API keys were stored in plaintext. Set a local passphrase to encrypt them. No account required."
      />
    )
  }

  return <>{children}</>
}
