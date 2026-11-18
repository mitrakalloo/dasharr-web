import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from '@/features/auth/AuthShell'
import { apiJson } from '@/lib/api/server'

interface BootstrapScreenProps {
  onDone: () => void
}

export function BootstrapScreen({ onDone }: BootstrapScreenProps) {
  const [setupToken, setSetupToken] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await apiJson('/api/setup/bootstrap', {
        method: 'POST',
        body: JSON.stringify({ setupToken, name, email, password }),
      })
      toast.success('Admin account created — sign in')
      onDone()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Setup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Set up Dasharr"
      description="Create the first admin account. You’ll need the SETUP_TOKEN from your server environment."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Setup token"
          type="password"
          value={setupToken}
          onChange={(event) => setSetupToken(event.target.value)}
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
          {busy ? 'Creating…' : 'Create admin'}
        </Button>
      </form>
    </AuthShell>
  )
}
