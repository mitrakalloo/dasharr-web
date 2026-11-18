import { useCallback, useEffect, useState } from 'react'

import { BootstrapScreen } from '@/features/auth/BootstrapScreen'
import { LoginScreen } from '@/features/auth/LoginScreen'
import { RedeemInviteScreen } from '@/features/auth/RedeemInviteScreen'
import { apiJson } from '@/lib/api/server'
import { authClient } from '@/lib/auth/client'
import { useConfigStore } from '@/stores/configStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { usePrefsStore } from '@/stores/prefsStore'

type GatePhase = 'loading' | 'setup' | 'login' | 'invite' | 'ready'

export function AccountGate({ children }: { children: React.ReactNode }) {
  const hydrateServices = useConfigStore((state) => state.hydrateFromServer)
  const hydratePrefs = usePrefsStore((state) => state.hydrateFromServer)
  const hydrateDashboard = useDashboardStore((state) => state.hydrateFromServer)
  const [phase, setPhase] = useState<GatePhase>('loading')

  const refresh = useCallback(async () => {
    setPhase('loading')
    try {
      const status = await apiJson<{ needsSetup: boolean }>('/api/setup/status')
      if (status.needsSetup) {
        setPhase('setup')
        return
      }
      const session = await authClient.getSession()
      if (!session.data?.user) {
        setPhase('login')
        return
      }
      await Promise.all([hydrateServices(), hydratePrefs(), hydrateDashboard()])
      setPhase('ready')
    } catch {
      setPhase('login')
    }
  }, [hydrateServices, hydratePrefs, hydrateDashboard])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (phase === 'loading') {
    return (
      <div className="auth-canvas flex min-h-dvh flex-col items-center justify-center gap-4">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-[var(--color-primary)] border-r-transparent" />
          <p className="text-sm text-[var(--color-muted-foreground)]">Preparing your desk…</p>
        </div>
      </div>
    )
  }

  if (phase === 'setup') {
    return <BootstrapScreen onDone={() => setPhase('login')} />
  }

  if (phase === 'invite') {
    return (
      <RedeemInviteScreen
        onDone={() => setPhase('login')}
        onBack={() => setPhase('login')}
      />
    )
  }

  if (phase === 'login') {
    return (
      <LoginScreen
        onDone={() => void refresh()}
        onRedeemInvite={() => setPhase('invite')}
      />
    )
  }

  return children
}
