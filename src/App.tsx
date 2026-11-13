import { Toaster } from 'sonner'

import { AppRouter } from '@/app/AppRouter'
import { VaultGate } from '@/features/vault/VaultGate'

export function App() {
  return (
    <>
      <VaultGate>
        <AppRouter />
      </VaultGate>
      <Toaster theme="dark" richColors position="bottom-right" />
    </>
  )
}
