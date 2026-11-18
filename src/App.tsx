import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { AppRouter } from '@/app/AppRouter'
import { AccountGate } from '@/features/auth/AccountGate'
import { useQueueNotifications } from '@/hooks/useQueueNotifications'
import { usePrefsStore } from '@/stores/prefsStore'

function PrefsEffects() {
  const experience = usePrefsStore((state) => state.experience)
  const hydrated = usePrefsStore((state) => state.hydrated)
  useQueueNotifications()

  useEffect(() => {
    if (!hydrated) return
    document.documentElement.dataset.density = experience.uiDensity
  }, [experience.uiDensity, hydrated])

  useEffect(() => {
    if (!hydrated) return
    const root = document.documentElement
    const preferLight = () => window.matchMedia('(prefers-color-scheme: light)').matches
    const apply = () => {
      const light =
        experience.themePreference === 'light' ||
        (experience.themePreference === 'system' && preferLight())
      root.dataset.theme = light ? 'light' : 'dark'
      root.style.colorScheme = light ? 'light' : 'dark'
    }
    apply()
    if (experience.themePreference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [experience.themePreference, hydrated])

  return null
}

export function App() {
  return (
    <>
      <AccountGate>
        <PrefsEffects />
        <AppRouter />
      </AccountGate>
      <Toaster theme="dark" richColors position="bottom-right" />
    </>
  )
}
