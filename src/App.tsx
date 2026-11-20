import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import { AppRouter } from '@/app/AppRouter'
import { AccountGate } from '@/features/auth/AccountGate'
import { useQueueNotifications } from '@/hooks/useQueueNotifications'
import { useStateSync } from '@/hooks/useStateSync'
import { usePrefsStore } from '@/stores/prefsStore'

function PrefsEffects({ onResolvedTheme }: { onResolvedTheme: (theme: 'dark' | 'light') => void }) {
  const experience = usePrefsStore((state) => state.experience)
  const hydrated = usePrefsStore((state) => state.hydrated)
  useQueueNotifications()
  useStateSync(hydrated)

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
      const resolved = light ? 'light' : 'dark'
      root.dataset.theme = resolved
      root.style.colorScheme = resolved
      onResolvedTheme(resolved)
      const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      if (meta) {
        meta.content = light ? '#f4f6fa' : '#06080d'
      }
    }
    apply()
    if (experience.themePreference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [experience.themePreference, hydrated, onResolvedTheme])

  return null
}

export function App() {
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  return (
    <>
      <AccountGate>
        <PrefsEffects onResolvedTheme={setResolvedTheme} />
        <AppRouter />
      </AccountGate>
      <Toaster
        theme={resolvedTheme}
        richColors
        position="bottom-right"
        toastOptions={{
          className:
            '!rounded-[var(--radius-lg)] !border !border-[var(--color-border)] !bg-[var(--color-card)] !text-[var(--color-foreground)] !shadow-[var(--elevation-float)] !backdrop-blur-xl',
        }}
      />
    </>
  )
}
