import { useCallback, useEffect, useState } from 'react'

import { DasharrMark } from '@/components/brand/DasharrMark'
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
      <div className="auth-canvas flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative flex size-14 items-center justify-center">
            <span
              className="absolute inset-0 animate-spin rounded-2xl border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]"
              aria-hidden
            />
            <DasharrMark className="size-9" />
          </div>
          <div className="text-center">
            <p className="font-display text-sm font-semibold tracking-tight">Dasharr</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
              Preparing your signal desk…
            </p>
          </div>
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
