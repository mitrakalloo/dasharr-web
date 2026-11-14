import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { AppRouter } from '@/app/AppRouter'
import { VaultGate } from '@/features/vault/VaultGate'
import { useQueueNotifications } from '@/hooks/useQueueNotifications'
import { usePrefsStore } from '@/stores/prefsStore'

function PrefsEffects() {
  const experience = usePrefsStore((state) => state.experience)
  useQueueNotifications()

  useEffect(() => {
    document.documentElement.dataset.density = experience.uiDensity
  }, [experience.uiDensity])

  useEffect(() => {
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
  }, [experience.themePreference])

  return null
}

export function App() {
  const hydratePrefs = usePrefsStore((state) => state.hydrate)

  useEffect(() => {
    hydratePrefs()
  }, [hydratePrefs])

  return (
    <>
      <PrefsEffects />
      <VaultGate>
        <AppRouter />
      </VaultGate>
      <Toaster theme="dark" richColors position="bottom-right" />
    </>
  )
}
