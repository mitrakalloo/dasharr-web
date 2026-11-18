import { useEffect, useState } from 'react'

import { apiJson } from '@/lib/api/server'
import { authClient } from '@/lib/auth/client'

type AuditRow = {
  id: string
  action: string
  targetType: string | null
  targetId: string | null
  createdAt: string
}

export function AuditCard() {
  const session = authClient.useSession()
  const isAdmin = (session.data?.user as { role?: string } | undefined)?.role === 'admin'
  const [events, setEvents] = useState<AuditRow[]>([])

  useEffect(() => {
    if (!isAdmin) return
    void apiJson<{ events: AuditRow[] }>('/api/account/audit')
      .then((payload) => setEvents(payload.events))
      .catch(() => setEvents([]))
  }, [isAdmin])

  if (!isAdmin) return null

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <h2 className="text-base font-semibold">Audit log</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Recent admin and household security events
        </p>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">No events yet.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto text-xs">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[var(--color-muted-foreground)]"
            >
              <p className="font-medium text-[var(--color-foreground)]">{event.action}</p>
              <p>
                {event.targetType ? `${event.targetType} ${event.targetId ?? ''}` : '—'} ·{' '}
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
