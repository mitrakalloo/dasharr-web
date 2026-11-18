import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth/client'

export function AccountCard() {
  const session = authClient.useSession()
  const user = session.data?.user

  async function signOut() {
    await authClient.signOut()
    toast.success('Signed out')
    window.location.reload()
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <h2 className="text-base font-semibold">Account</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {user ? `${user.name} · ${user.email}` : 'Signed in'}
        </p>
      </div>
      <Button variant="secondary" onClick={() => void signOut()}>
        Sign out
      </Button>
    </section>
  )
}
