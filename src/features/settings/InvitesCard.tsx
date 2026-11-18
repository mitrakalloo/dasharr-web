import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiJson } from '@/lib/api/server'
import { authClient } from '@/lib/auth/client'

export function InvitesCard() {
  const session = authClient.useSession()
  const isAdmin = session.data?.user && (session.data.user as { role?: string }).role === 'admin'
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!isAdmin) return null

  async function createInvite() {
    setBusy(true)
    setToken(null)
    try {
      const result = await apiJson<{ token: string }>('/api/invites', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() || undefined }),
      })
      setToken(result.token)
      toast.success('Invite created — copy the token now')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invite failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <h2 className="text-base font-semibold">Household invites</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Invite-only signup. Tokens are shown once.
        </p>
      </div>
      <Input
        label="Optional email lock"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="member@example.com"
      />
      <Button variant="secondary" disabled={busy} onClick={() => void createInvite()}>
        {busy ? 'Creating…' : 'Create invite'}
      </Button>
      {token ? (
        <p className="break-all rounded-xl bg-[var(--color-muted)] p-3 font-mono text-xs">{token}</p>
      ) : null}
    </section>
  )
}
