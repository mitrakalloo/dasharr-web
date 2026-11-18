import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from '@/features/auth/AuthShell'
import { apiJson } from '@/lib/api/server'
import { authClient } from '@/lib/auth/client'

interface LoginScreenProps {
  onDone: () => void
  onRedeemInvite: () => void
}

export function LoginScreen({ onDone, onRedeemInvite }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [oidc, setOidc] = useState(false)

  useEffect(() => {
    void apiJson<{ oidc?: boolean }>('/api/health')
      .then((payload) => setOidc(Boolean(payload.oidc)))
      .catch(() => setOidc(false))
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) throw new Error(result.error.message || 'Sign-in failed')
      onDone()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  async function signInOidc() {
    setBusy(true)
    try {
      await authClient.signIn.social({
        provider: 'oidc' as 'github',
        callbackURL: '/',
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OIDC sign-in failed')
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Household accounts only. Service API keys stay encrypted on the server."
      footer={
        <button
          type="button"
          onClick={onRedeemInvite}
          className="cursor-pointer text-sm font-medium text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]"
        >
          Have an invite? Redeem it
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button type="submit" className="w-full" loading={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      {oidc ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full"
          disabled={busy}
          onClick={() => void signInOidc()}
        >
          Sign in with SSO
        </Button>
      ) : null}
    </AuthShell>
  )
}
