import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
      // providerId from server genericOAuth config
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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        Household accounts only. Service API keys stay on the server.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={busy}>
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
      <button
        type="button"
        onClick={onRedeemInvite}
        className="mt-4 text-sm text-[var(--color-secondary)]"
      >
        Have an invite?
      </button>
    </div>
  )
}
