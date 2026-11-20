import { useEffect, useState } from 'react'
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiJson } from '@/lib/api/server'
import { authClient } from '@/lib/auth/client'

type SessionRow = {
  id: string
  current: boolean
  ipAddress: string | null
  userAgent: string | null
  updatedAt: string
}

export function AccountCard() {
  const session = authClient.useSession()
  const user = session.data?.user
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [busy, setBusy] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  async function loadSessions() {
    try {
      const payload = await apiJson<{ sessions: SessionRow[] }>('/api/account/sessions')
      setSessions(payload.sessions)
    } catch {
      // ignore until authenticated
    }
  }

  useEffect(() => {
    void loadSessions()
  }, [])

  async function signOut() {
    await authClient.signOut()
    toast.success('Signed out')
    window.location.reload()
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await apiJson('/api/account/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      toast.success('Password updated — other sessions revoked')
      setCurrentPassword('')
      setNewPassword('')
      await loadSessions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not change password')
    } finally {
      setBusy(false)
    }
  }

  async function revoke(id: string) {
    setRevokingId(id)
    try {
      await apiJson(`/api/account/sessions/${id}`, { method: 'DELETE' })
      toast.message('Session revoked')
      await loadSessions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Revoke failed')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <section className="panel space-y-5 rounded-[var(--radius-2xl)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
            Account
          </h2>
          <p className="mt-1 text-sm text-[var(--color-foreground)]">
            {user ? (
              <>
                <span className="font-medium">{user.name}</span>
                <span className="text-[var(--color-muted-foreground)]"> · {user.email}</span>
              </>
            ) : (
              'Signed in'
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Experience preferences are per-user; dashboards are shared by the household.
          </p>
        </div>

        <Button size="sm" variant="secondary" onClick={() => void signOut()}>
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>

      <form
        onSubmit={(event) => void changePassword(event)}
        className="space-y-3.5 border-t border-[var(--color-hairline)] pt-4"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
          <KeyRound className="size-3.5" aria-hidden="true" />
          <span>Update password</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
          <Input
            label="New password (12+ chars)"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={12}
          />
        </div>
        <Button type="submit" size="sm" variant="secondary" loading={busy}>
          Change password
        </Button>
      </form>

      {sessions.length > 0 ? (
        <div className="space-y-2.5 border-t border-[var(--color-hairline)] pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            <span>Active sessions ({sessions.length})</span>
          </div>
          <div className="space-y-2">
            {sessions.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[var(--color-foreground)]">
                      {row.current ? 'This device' : row.userAgent || 'Active session'}
                    </p>
                    {row.current ? <Badge tone="primary">Current</Badge> : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)] tabular">
                    {row.ipAddress || '—'} · {new Date(row.updatedAt).toLocaleString()}
                  </p>
                </div>
                {!row.current ? (
                  <Button
                    size="sm"
                    variant="danger"
                    loading={revokingId === row.id}
                    onClick={() => void revoke(row.id)}
                  >
                    Revoke
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
