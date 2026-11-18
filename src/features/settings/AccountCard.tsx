import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
    try {
      await apiJson(`/api/account/sessions/${id}`, { method: 'DELETE' })
      toast.message('Session revoked')
      await loadSessions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Revoke failed')
    }
  }

  return (
    <section className="space-y-4 panel rounded-[var(--radius-2xl)] p-4">
      <div>
        <h2 className="text-base font-semibold">Account</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {user ? `${user.name} · ${user.email}` : 'Signed in'}
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Experience prefs are per-user; dashboards are shared by the household.
        </p>
      </div>

      <form onSubmit={(event) => void changePassword(event)} className="space-y-3">
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <Input
          label="New password (12+)"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={12}
        />
        <Button type="submit" variant="secondary" disabled={busy}>
          {busy ? 'Saving…' : 'Change password'}
        </Button>
      </form>

      {sessions.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Sessions</h3>
          {sessions.map((row) => (
            <div
              key={row.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2"
            >
              <div className="min-w-0 text-xs text-[var(--color-muted-foreground)]">
                <p className="truncate text-sm text-[var(--color-foreground)]">
                  {row.current ? 'This device' : row.userAgent || 'Session'}
                </p>
                <p className="truncate">
                  {row.ipAddress || '—'} · {new Date(row.updatedAt).toLocaleString()}
                </p>
              </div>
              {!row.current ? (
                <Button variant="danger" onClick={() => void revoke(row.id)}>
                  Revoke
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <Button variant="secondary" onClick={() => void signOut()}>
        Sign out
      </Button>
    </section>
  )
}
