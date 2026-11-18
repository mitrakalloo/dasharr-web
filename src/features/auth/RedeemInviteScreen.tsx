import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from '@/features/auth/AuthShell'
import { apiJson } from '@/lib/api/server'

interface RedeemInviteScreenProps {
  onDone: () => void
  onBack: () => void
}

export function RedeemInviteScreen({ onDone, onBack }: RedeemInviteScreenProps) {
  const [token, setToken] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await apiJson('/api/invites/redeem', {
        method: 'POST',
        body: JSON.stringify({ token, name, email, password }),
      })
      toast.success('Account created — sign in')
      onDone()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invite failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Redeem invite"
      description="Join this Dasharr household with an invite token from an admin."
      footer={
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-sm font-medium text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]"
        >
          Back to sign in
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Invite token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Password (12+ chars)"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={12}
        />
        <Button type="submit" className="w-full" loading={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
