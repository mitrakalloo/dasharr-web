import { useState } from 'react'
import { Check, Copy, UserPlus } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)

  if (!isAdmin) return null

  async function createInvite() {
    setBusy(true)
    setToken(null)
    setCopied(false)
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

  async function copyToken() {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      toast.success('Invite token copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <section className="panel space-y-3.5 rounded-[var(--radius-2xl)] p-5">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
          Household invites
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Invite-only signup. Generated tokens are shown only once.
        </p>
      </div>
      <Input
        label="Optional email lock"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="member@example.com"
      />
      <Button size="sm" variant="secondary" loading={busy} onClick={() => void createInvite()}>
        <UserPlus className="size-3.5" />
        Create invite
      </Button>
      {token ? (
        <div className="space-y-2 rounded-[var(--radius-xl)] border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)]/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
              One-time invite token
            </span>
            <Button size="sm" variant="secondary" onClick={() => void copyToken()}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="select-all break-all font-mono text-xs text-[var(--color-foreground)]">
            {token}
          </p>
        </div>
      ) : null}
    </section>
  )
}
