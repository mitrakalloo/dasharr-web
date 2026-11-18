import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Redeem invite</h1>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        Join this Dasharr household with an invite token from an admin.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <Input
          label="Invite token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <button type="button" onClick={onBack} className="mt-4 text-sm text-[var(--color-secondary)]">
        Back to sign in
      </button>
    </div>
  )
}
